import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  isConnected: boolean;
  address: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletStatus: (state, action: PayloadAction<{ isConnected: boolean; address: string | null }>) => {
      state.isConnected = action.payload.isConnected;
      state.address = action.payload.address;
    },
  },
});

export const { setWalletStatus } = walletSlice.actions;
export default walletSlice.reducer;
