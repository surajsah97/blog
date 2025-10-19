import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Chat, ChatDocument } from './schemas/chat.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) {}

  async getChatMessages(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: MessageDocument[]; pagination: any }> {
    // Verify user is part of the chat
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      participants: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    const messages = await this.messageModel
      .find({
        chat: new Types.ObjectId(chatId),
        isDeleted: false,
      })
      .populate('sender', 'fullName email profileImage')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.messageModel.countDocuments({
      chat: new Types.ObjectId(chatId),
      isDeleted: false,
    });

    return {
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async sendMessage(
    chatId: string,
    userId: string,
    content: string,
    messageType: string = 'text',
    attachments?: any[],
    replyTo?: string,
  ): Promise<MessageDocument> {
    if (!content || content.trim() === '') {
      throw new BadRequestException('Message content is required');
    }

    // Verify user is part of the chat
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      participants: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    // Create message
    const message = await this.messageModel.create({
      chat: new Types.ObjectId(chatId),
      sender: new Types.ObjectId(userId),
      content: content.trim(),
      messageType,
      attachments: attachments || [],
      replyTo: replyTo ? new Types.ObjectId(replyTo) : undefined,
    });

    // Update chat's last message
    chat.lastMessage = message._id as any;
    (chat as any).updatedAt = new Date();
    await chat.save();

    return (await this.messageModel
      .findById(message._id)
      .populate('sender', 'fullName email profileImage')
      .populate('replyTo')) as MessageDocument;
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if already read by this user
    const alreadyRead = message.readBy?.some(
      (r) => r.user.toString() === userId,
    );

    if (!alreadyRead) {
      if (!message.readBy) message.readBy = [];
      message.readBy.push({
        user: new Types.ObjectId(userId),
        readAt: new Date(),
      });
      await message.save();
    }
  }

  async markAllMessagesAsRead(chatId: string, userId: string): Promise<number> {
    // Verify user is part of the chat
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      participants: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    // Get all unread messages
    const messages = await this.messageModel.find({
      chat: new Types.ObjectId(chatId),
      'readBy.user': { $ne: new Types.ObjectId(userId) },
      isDeleted: false,
    });

    // Mark all as read
    for (const message of messages) {
      if (!message.readBy) message.readBy = [];
      message.readBy.push({
        user: new Types.ObjectId(userId),
        readAt: new Date(),
      });
      await message.save();
    }

    return messages.length;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findOne({
      _id: new Types.ObjectId(messageId),
      sender: new Types.ObjectId(userId),
    });

    if (!message) {
      throw new NotFoundException(
        'Message not found or you are not the sender',
      );
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    // Get all chats user is part of
    const chats = await this.chatModel.find({
      participants: new Types.ObjectId(userId),
      isActive: true,
    });

    const chatIds = chats.map((chat) => chat._id);

    // Count unread messages
    const unreadCount = await this.messageModel.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: new Types.ObjectId(userId) },
      'readBy.user': { $ne: new Types.ObjectId(userId) },
      isDeleted: false,
    });

    return { unreadCount };
  }
}
