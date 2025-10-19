import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async getUserChats(userId: string): Promise<ChatDocument[]> {
    try {
      const chats = await this.chatModel
        .find({
          participants: new Types.ObjectId(userId),
          isActive: true,
        })
        .populate('participants', 'fullName email profileImage')
        .populate({
          path: 'lastMessage',
          populate: {
            path: 'sender',
            select: 'fullName',
          },
        })
        .populate('createdBy', 'fullName email')
        .sort({ updatedAt: -1 })
        .exec();

      return chats as ChatDocument[];
    } catch (error) {
      throw new BadRequestException('Error fetching user chats');
    }
  }

  async createOneToOneChat(
    userId: string,
    participantId: string,
  ): Promise<ChatDocument> {
    if (!participantId) {
      throw new BadRequestException('Participant ID is required');
    }

    // Check if chat already exists
    const existingChat = await this.chatModel.findOne({
      type: 'one-to-one',
      participants: {
        $all: [new Types.ObjectId(userId), new Types.ObjectId(participantId)],
        $size: 2,
      },
    });

    if (existingChat) {
      return (await this.chatModel
        .findById(existingChat._id)
        .populate(
          'participants',
          'fullName email profileImage',
        )) as ChatDocument;
    }

    // Create new chat
    const newChat = await this.chatModel.create({
      type: 'one-to-one',
      participants: [
        new Types.ObjectId(userId),
        new Types.ObjectId(participantId),
      ],
      createdBy: new Types.ObjectId(userId),
    });

    return (await this.chatModel
      .findById(newChat._id)
      .populate('participants', 'fullName email profileImage')) as ChatDocument;
  }

  async createGroupChat(
    userId: string,
    name: string,
    description?: string,
    participantIds?: string[],
    avatar?: string,
  ): Promise<ChatDocument> {
    if (!name || !participantIds || participantIds.length < 2) {
      throw new BadRequestException(
        'Group name and at least 2 participants are required',
      );
    }

    // Add creator to participants if not included
    const allParticipants = [...new Set([userId, ...participantIds])];

    const newChat = await this.chatModel.create({
      type: 'group',
      name,
      description,
      participants: allParticipants.map((id) => new Types.ObjectId(id)),
      admins: [new Types.ObjectId(userId)],
      createdBy: new Types.ObjectId(userId),
      avatar,
    });

    return (await this.chatModel
      .findById(newChat._id)
      .populate('participants', 'fullName email profileImage')
      .populate('admins', 'fullName email')
      .populate('createdBy', 'fullName email')) as ChatDocument;
  }

  async getChatById(chatId: string, userId: string): Promise<ChatDocument> {
    const chat = await this.chatModel
      .findOne({
        _id: new Types.ObjectId(chatId),
        participants: new Types.ObjectId(userId),
      })
      .populate('participants', 'fullName email profileImage')
      .populate('admins', 'fullName email')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'fullName',
        },
      });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat as ChatDocument;
  }

  async updateGroupChat(
    chatId: string,
    userId: string,
    updates: { name?: string; description?: string; avatar?: string },
  ): Promise<ChatDocument> {
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      type: 'group',
      admins: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or you are not an admin');
    }

    if (updates.name) chat.name = updates.name;
    if (updates.description !== undefined)
      chat.description = updates.description;
    if (updates.avatar) chat.avatar = updates.avatar;

    await chat.save();

    return (await this.chatModel
      .findById(chatId)
      .populate('participants', 'fullName email profileImage')
      .populate('admins', 'fullName email')) as ChatDocument;
  }

  async addParticipants(
    chatId: string,
    userId: string,
    participantIds: string[],
  ): Promise<ChatDocument> {
    if (!participantIds || participantIds.length === 0) {
      throw new BadRequestException('Participant IDs are required');
    }

    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      type: 'group',
      admins: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or you are not an admin');
    }

    // Add new participants
    const newParticipants = participantIds
      .filter((id) => !chat.participants.some((p) => p.toString() === id))
      .map((id) => new Types.ObjectId(id));

    chat.participants.push(...newParticipants);
    await chat.save();

    return (await this.chatModel
      .findById(chatId)
      .populate('participants', 'fullName email profileImage')) as ChatDocument;
  }

  async removeParticipant(
    chatId: string,
    userId: string,
    participantId: string,
  ): Promise<ChatDocument> {
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      type: 'group',
      admins: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or you are not an admin');
    }

    chat.participants = chat.participants.filter(
      (p) => p.toString() !== participantId,
    );

    // Also remove from admins if present
    if (chat.admins) {
      chat.admins = chat.admins.filter((a) => a.toString() !== participantId);
    }

    await chat.save();

    return (await this.chatModel
      .findById(chatId)
      .populate('participants', 'fullName email profileImage')) as ChatDocument;
  }

  async leaveGroupChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      type: 'group',
      participants: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    chat.participants = chat.participants.filter(
      (p) => p.toString() !== userId,
    );

    if (chat.admins) {
      chat.admins = chat.admins.filter((a) => a.toString() !== userId);
    }

    await chat.save();
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      createdBy: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or you are not the creator');
    }

    chat.isActive = false;
    await chat.save();
  }
}
