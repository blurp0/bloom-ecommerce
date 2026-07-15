export type Role = "CUSTOMER" | "SELLER";

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  createdAt: string;
}

export interface LiveMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: string; // "CUSTOMER" | "SELLER" or generic string from Ably channel payload
  text: string;
  createdAt: string;
}

export interface Conversation {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  /** First product name(s) for display — "Rose Bouquet" or "Rose Bouquet & 2 more" */
  itemLabel: string;
  lastMessage: {
    text: string;
    senderRole: Role;
    createdAt: string;
  } | null;
  messageCount: number;
}

export interface ConversationsResponse {
  data: {
    conversations: Conversation[];
  };
}

export interface FetchMessagesResponse {
  data: {
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

export interface SendMessageResponse {
  data: Message;
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  hasMore: boolean;
  loadMore: () => void;
  sendMessage: (text: string) => Promise<Message>;
  isSending: boolean;
  sendError: Error | null;
}

export type ConnectionState =
  | "initialized"
  | "connecting"
  | "connected"
  | "suspended"
  | "failed"
  | "closed";

export interface UseMessageChannelOptions {
  /** Order ID to subscribe to. */
  orderId: string;
  /** Whether the message thread is currently visible/focused. */
  isThreadVisible: boolean;
}

export interface UseMessageChannelReturn {
  /** Real-time messages received via Ably since mount. */
  liveMessages: LiveMessage[];
  /** True when Ably is in suspended or failed state. */
  hasConnectionError: boolean;
}
