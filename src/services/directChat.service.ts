import api from './api';

export type DirectConversationDto = {
  id: string;
  userId: string;
  userLastReadAt: string | null;
  adminLastReadAt: string | null;
};

export type DirectMessageDto = {
  id: string;
  authorRole: 'USER' | 'ADMIN' | 'OPERATOR';
  authorUserId: string | null;
  text: string | null;
  attachmentType: 'IMAGE' | 'AUDIO' | null;
  attachmentUrl: string | null;
  createdAt: string;
};

export const directChatService = {
  getConversation: async (): Promise<DirectConversationDto> => {
    const { data } = await api.get<DirectConversationDto>('/direct/conversation');
    return data;
  },

  listMessages: async (params?: { since?: string; limit?: number }) => {
    const { data } = await api.get<{ conversationId: string; messages: DirectMessageDto[] }>(
      '/direct/messages',
      { params },
    );
    return data;
  },

  sendMessage: async (payload: { text?: string; file?: File; attachmentType?: 'IMAGE' | 'AUDIO' }) => {
    const form = new FormData();
    if (payload.text) form.append('text', payload.text);
    if (payload.file) form.append('file', payload.file);
    if (payload.attachmentType) form.append('attachmentType', payload.attachmentType);
    const { data } = await api.post<DirectMessageDto>('/direct/messages', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

