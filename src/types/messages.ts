export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACT = 'contact',
  STICKER = 'sticker',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export interface Message {
  _id: string;
  whatsappMessageId: string;
  from: string;
  to: string;
  userId?: string;
  type: MessageType;
  direction: MessageDirection;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  metadata: {
    hasMedia: boolean;
    isForwarded: boolean;
    isStarred: boolean;
    mediaType?: string;
    caption?: string;
  };
  status: MessageStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  failureReason?: string;
  conversationId: string;
  replyToMessageId?: string;
  campaignId?: string;
  templateName?: string;
  entityId: string;
  entityPath?: string;
  tenantId: string;
  isStarred: boolean;
  isArchived: boolean;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  timestamp?: string;
  senderE164?: string;
  receiverE164?: string;
}
