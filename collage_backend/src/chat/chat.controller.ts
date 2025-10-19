import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/utils/guards/jwt.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  // Chat Management Routes

  @Get('chats')
  @ApiOperation({ summary: 'Get all user chats' })
  @ApiResponse({ status: 200, description: 'Chats retrieved successfully' })
  async getUserChats(@Request() req) {
    const userId = req.user.userId;
    const chats = await this.chatService.getUserChats(userId);
    return {
      success: true,
      data: chats,
    };
  }

  @Post('chats/one-to-one')
  @ApiOperation({ summary: 'Create one-to-one chat' })
  @ApiResponse({ status: 201, description: 'Chat created successfully' })
  async createOneToOneChat(
    @Request() req,
    @Body() body: { participantId: string },
  ) {
    const userId = req.user.userId;
    const chat = await this.chatService.createOneToOneChat(
      userId,
      body.participantId,
    );
    return {
      success: true,
      data: chat,
      message: 'Chat created successfully',
    };
  }

  @Post('chats/group')
  @ApiOperation({ summary: 'Create group chat' })
  @ApiResponse({ status: 201, description: 'Group chat created successfully' })
  async createGroupChat(
    @Request() req,
    @Body()
    body: {
      name: string;
      description?: string;
      participantIds: string[];
      avatar?: string;
    },
  ) {
    const userId = req.user.userId;
    const chat = await this.chatService.createGroupChat(
      userId,
      body.name,
      body.description,
      body.participantIds,
      body.avatar,
    );
    return {
      success: true,
      data: chat,
      message: 'Group chat created successfully',
    };
  }

  @Get('chats/:chatId')
  @ApiOperation({ summary: 'Get chat by ID' })
  @ApiResponse({ status: 200, description: 'Chat retrieved successfully' })
  async getChatById(@Request() req, @Param('chatId') chatId: string) {
    const userId = req.user.userId;
    const chat = await this.chatService.getChatById(chatId, userId);
    return {
      success: true,
      data: chat,
    };
  }

  @Put('chats/:chatId')
  @ApiOperation({ summary: 'Update group chat' })
  @ApiResponse({ status: 200, description: 'Group chat updated successfully' })
  async updateGroupChat(
    @Request() req,
    @Param('chatId') chatId: string,
    @Body() body: { name?: string; description?: string; avatar?: string },
  ) {
    const userId = req.user.userId;
    const chat = await this.chatService.updateGroupChat(chatId, userId, body);
    return {
      success: true,
      data: chat,
      message: 'Group chat updated successfully',
    };
  }

  @Post('chats/:chatId/participants')
  @ApiOperation({ summary: 'Add participants to group chat' })
  @ApiResponse({ status: 200, description: 'Participants added successfully' })
  async addParticipants(
    @Request() req,
    @Param('chatId') chatId: string,
    @Body() body: { participantIds: string[] },
  ) {
    const userId = req.user.userId;
    const chat = await this.chatService.addParticipants(
      chatId,
      userId,
      body.participantIds,
    );
    return {
      success: true,
      data: chat,
      message: 'Participants added successfully',
    };
  }

  @Delete('chats/:chatId/participants/:participantId')
  @ApiOperation({ summary: 'Remove participant from group chat' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  async removeParticipant(
    @Request() req,
    @Param('chatId') chatId: string,
    @Param('participantId') participantId: string,
  ) {
    const userId = req.user.userId;
    const chat = await this.chatService.removeParticipant(
      chatId,
      userId,
      participantId,
    );
    return {
      success: true,
      data: chat,
      message: 'Participant removed successfully',
    };
  }

  @Post('chats/:chatId/leave')
  @ApiOperation({ summary: 'Leave group chat' })
  @ApiResponse({ status: 200, description: 'Left group chat successfully' })
  async leaveGroupChat(@Request() req, @Param('chatId') chatId: string) {
    const userId = req.user.userId;
    await this.chatService.leaveGroupChat(chatId, userId);
    return {
      success: true,
      message: 'Left group chat successfully',
    };
  }

  @Delete('chats/:chatId')
  @ApiOperation({ summary: 'Delete chat' })
  @ApiResponse({ status: 200, description: 'Chat deleted successfully' })
  async deleteChat(@Request() req, @Param('chatId') chatId: string) {
    const userId = req.user.userId;
    await this.chatService.deleteChat(chatId, userId);
    return {
      success: true,
      message: 'Chat deleted successfully',
    };
  }

  // Message Management Routes

  @Get('chats/:chatId/messages')
  @ApiOperation({ summary: 'Get chat messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getChatMessages(
    @Request() req,
    @Param('chatId') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const userId = req.user.userId;
    const result = await this.messageService.getChatMessages(
      chatId,
      userId,
      page,
      limit,
    );
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Post('chats/:chatId/messages')
  @ApiOperation({ summary: 'Send message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Request() req,
    @Param('chatId') chatId: string,
    @Body()
    body: {
      content: string;
      messageType?: string;
      attachments?: any[];
      replyTo?: string;
    },
  ) {
    const userId = req.user.userId;
    const message = await this.messageService.sendMessage(
      chatId,
      userId,
      body.content,
      body.messageType,
      body.attachments,
      body.replyTo,
    );
    return {
      success: true,
      data: message,
      message: 'Message sent successfully',
    };
  }

  @Put('messages/:messageId/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markMessageAsRead(
    @Request() req,
    @Param('messageId') messageId: string,
  ) {
    const userId = req.user.userId;
    await this.messageService.markMessageAsRead(messageId, userId);
    return {
      success: true,
      message: 'Message marked as read',
    };
  }

  @Put('chats/:chatId/messages/read-all')
  @ApiOperation({ summary: 'Mark all messages as read' })
  @ApiResponse({ status: 200, description: 'All messages marked as read' })
  async markAllMessagesAsRead(@Request() req, @Param('chatId') chatId: string) {
    const userId = req.user.userId;
    const count = await this.messageService.markAllMessagesAsRead(
      chatId,
      userId,
    );
    return {
      success: true,
      message: 'All messages marked as read',
      count,
    };
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    const userId = req.user.userId;
    await this.messageService.deleteMessage(messageId, userId);
    return {
      success: true,
      message: 'Message deleted successfully',
    };
  }

  @Get('messages/unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  async getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    const result = await this.messageService.getUnreadCount(userId);
    return {
      success: true,
      data: result,
    };
  }
}
