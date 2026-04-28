import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  token: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  token: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletStatus: (state, action: PayloadAction<{ isConnected: boolean; address: string | null; token?: string | null }>) => {
      state.isConnected = action.payload.isConnected;
      state.address = action.payload.address;
      if (action.payload.token !== undefined) {
        state.token = action.payload.token;
      }
    },
  },
});

export const { setWalletStatus } = walletSlice.actions;
export default walletSlice.reducer;
