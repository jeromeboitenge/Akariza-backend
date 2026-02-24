import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { OrgChatController } from './org-chat.controller';
import { OrgChatService } from './org-chat.service';

@Module({
  controllers: [MessagesController, OrgChatController],
  providers: [MessagesService, OrgChatService],
})
export class MessagesModule {}
