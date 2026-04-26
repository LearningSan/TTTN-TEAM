package com.example.tttnbe.payment.service;

import com.example.tttnbe.common.exception.CustomException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.Transaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class Web3ServiceImpl {

    private final Web3j web3j;

    @Value("${web3.admin.wallet}")
    private String adminWallet;

    public Web3ServiceImpl(@Value("${web3.rpc.url}") String rpcUrl) {
        this.web3j = Web3j.build(new HttpService(rpcUrl));
    }

    /**
     * Hàm kiểm tra giao dịch chuyển Native Coin (BNB / ETH)
     * @param txHash: Mã giao dịch FE gửi lên
     * @param expectedAmount: Số tiền BNB tổng của đơn hàng (lấy từ DB)
     */
    public boolean verifyNativeTransaction(String txHash, BigDecimal expectedAmount) {
        try {
            // 1. Lấy thông tin Chi tiết giao dịch (để xem số tiền và người nhận)
            Optional<Transaction> txOpt = web3j.ethGetTransactionByHash(txHash).send().getTransaction();
            if (txOpt.isEmpty()) {
                throw new CustomException(400, "Không tìm thấy giao dịch trên Blockchain!");
            }
            Transaction tx = txOpt.get();

            // 2. Lấy Biên lai giao dịch (để xem thành công hay thất bại)
            Optional<TransactionReceipt> receiptOpt = web3j.ethGetTransactionReceipt(txHash).send().getTransactionReceipt();
            if (receiptOpt.isEmpty() || !"0x1".equals(receiptOpt.get().getStatus())) {
                throw new CustomException(400, "Giao dịch đã bị lỗi hoặc đang chờ xác nhận (Pending)!");
            }

            // 3. KIỂM TRA CHỐT CHẶN: Có đúng chuyển vào ví Admin không?
            if (tx.getTo() == null || !tx.getTo().equalsIgnoreCase(adminWallet)) {
                throw new CustomException(400, "Cảnh báo gian lận: Tiền không được chuyển vào ví của Hệ thống!");
            }

            // 4. KIỂM TRA CHỐT CHẶN: Có chuyển đủ tiền không?
            // Tiền trên Blockchain lưu dưới dạng WEI (1 BNB = 10^18 WEI). Ta phải convert nó về BNB
            BigDecimal actualAmountBNB = Convert.fromWei(tx.getValue().toString(), Convert.Unit.ETHER);

            // So sánh số tiền thực tế nhận được (actual) với số tiền của Đơn hàng (expected)
            // Dùng compareTo để so sánh an toàn cho số thập phân
            if (actualAmountBNB.compareTo(expectedAmount) < 0) {
                throw new CustomException(400, "Thanh toán thiếu tiền! Yêu cầu: " + expectedAmount + " BNB, Thực tế gửi: " + actualAmountBNB + " BNB");
            }

            // Vượt qua 4 ải -> Giao dịch sạch 100%
            return true;

        } catch (CustomException ce) {
            throw ce; // Quăng tiếp lỗi do mình tự định nghĩa
        } catch (Exception e) {
            throw new CustomException(500, "Lỗi kết nối Web3j: " + e.getMessage());
        }
    }
}