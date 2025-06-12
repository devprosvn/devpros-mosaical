
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      vault: 'NFT Vault',
      loans: 'Loans',
      dpo: 'DPO Token',
      analytics: 'Analytics',
      
      // Wallet
      connectWallet: 'Connect Wallet',
      disconnect: 'Disconnect',
      wrongNetwork: 'Wrong Network',
      switchNetwork: 'Switch to Saga',
      
      // Dashboard
      totalValue: 'Total Value',
      collateralValue: 'Collateral Value',
      borrowedAmount: 'Borrowed Amount',
      healthFactor: 'Health Factor',
      availableCredit: 'Available Credit',
      
      // NFT
      yourNFTs: 'Your NFTs',
      depositedNFTs: 'Deposited NFTs',
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      
      // Loans
      activeLoan: 'Active Loan',
      borrow: 'Borrow',
      repay: 'Repay',
      liquidationWarning: 'Liquidation Warning',
      healthFactorLow: 'Your health factor is dangerously low!',
      
      // DPO
      dpoBalance: 'DPO Balance',
      transfer: 'Transfer',
      history: 'History',
      
      // Common
      amount: 'Amount',
      balance: 'Balance',
      confirm: 'Confirm',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    }
  },
  vi: {
    translation: {
      // Navigation
      dashboard: 'Tổng quan',
      vault: 'Kho NFT',
      loans: 'Vay mượn',
      dpo: 'Token DPO',
      analytics: 'Phân tích',
      
      // Wallet
      connectWallet: 'Kết nối ví',
      disconnect: 'Ngắt kết nối',
      wrongNetwork: 'Sai mạng',
      switchNetwork: 'Chuyển sang Saga',
      
      // Dashboard
      totalValue: 'Tổng giá trị',
      collateralValue: 'Giá trị thế chấp',
      borrowedAmount: 'Số tiền vay',
      healthFactor: 'Hệ số sức khỏe',
      availableCredit: 'Tín dụng khả dụng',
      
      // NFT
      yourNFTs: 'NFT của bạn',
      depositedNFTs: 'NFT đã gửi',
      deposit: 'Gửi',
      withdraw: 'Rút',
      
      // Loans
      activeLoan: 'Khoản vay đang hoạt động',
      borrow: 'Vay',
      repay: 'Trả',
      liquidationWarning: 'Cảnh báo thanh lý',
      healthFactorLow: 'Hệ số sức khỏe của bạn đang ở mức nguy hiểm!',
      
      // DPO
      dpoBalance: 'Số dư DPO',
      transfer: 'Chuyển',
      history: 'Lịch sử',
      
      // Common
      amount: 'Số lượng',
      balance: 'Số dư',
      confirm: 'Xác nhận',
      cancel: 'Hủy',
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Thành công',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
