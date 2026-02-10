import { db } from '../db';

export const telegramService = {
  sendMessage: async (text: string) => {
    const settings = await db.getSettings();
    if (!settings.enableNotifications || !settings.telegramBotToken || !settings.telegramChatId) {
      console.warn('Telegram notifications are disabled or not configured.');
      return;
    }

    const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
    const body = {
      chat_id: settings.telegramChatId,
      text: text,
      parse_mode: 'HTML'
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`Telegram API responded with ${response.status}`);
      }
    } catch (error) {
      console.error('Telegram notification failed:', error);
    }
  },

  notifyNewMember: (member: any) => {
    const msg = `👤 <b>New Member Registered</b>\n\n` +
                `<b>Name:</b> ${member.nameEn}\n` +
                `<b>ID:</b> ${member.memberId}\n` +
                `<b>Mobile:</b> ${member.mobile}\n` +
                `<b>Joined:</b> ${new Date(member.joinedDate).toLocaleDateString()}\n` +
                `<b>Installment:</b> ৳${member.fixedAmount}`;
    telegramService.sendMessage(msg);
  },

  notifyPaymentRequest: (payment: any, member: any) => {
    const msg = `💰 <b>New Payment Request</b>\n\n` +
                `<b>Member:</b> ${member?.nameEn || 'N/A'} (${payment.memberId})\n` +
                `<b>Amount:</b> ৳${payment.amount}\n` +
                `<b>Fine:</b> ৳${payment.fineAmount}\n` +
                `<b>Total:</b> ৳${payment.totalPaid}\n` +
                `<b>Method:</b> ${payment.methodName}\n` +
                `<b>Sender:</b> ${payment.senderNumber}\n` +
                `<b>TrxID:</b> <code>${payment.transactionId}</code>\n\n` +
                `<i>Action: Please verify from Admin Panel.</i>`;
    telegramService.sendMessage(msg);
  },

  notifyPaymentVerified: (payment: any, member: any) => {
    const msg = `✅ <b>Payment Verified</b>\n\n` +
                `<b>Member:</b> ${member?.nameEn || 'N/A'} (${payment.memberId})\n` +
                `<b>Amount:</b> ৳${payment.totalPaid}\n` +
                `<b>Date:</b> ${new Date(payment.date).toLocaleDateString()}\n` +
                `<b>Status:</b> Success / Verified`;
    telegramService.sendMessage(msg);
  },

  notifyReportSummary: (stats: { totalMembers: number, totalCollection: number, pendingApprovals: number }) => {
    const msg = `📊 <b>System Report Summary</b>\n\n` +
                `<b>Active Members:</b> ${stats.totalMembers}\n` +
                `<b>Total Savings:</b> ৳${stats.totalCollection.toLocaleString()}\n` +
                `<b>Pending Approvals:</b> ${stats.pendingApprovals}\n\n` +
                `<i>Report Generated: ${new Date().toLocaleString()}</i>`;
    telegramService.sendMessage(msg);
  }
};
