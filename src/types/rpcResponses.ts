
export interface RpcResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface MuteUserResponse extends RpcResponse {
  expires_at?: string;
}

export interface DeleteMessageResponse extends RpcResponse {
  message?: string;
}
