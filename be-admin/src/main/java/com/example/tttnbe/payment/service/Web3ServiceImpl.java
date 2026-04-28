package com.example.tttnbe.payment.service;

import com.example.tttnbe.common.exception.CustomException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.Transaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

@Service
public class Web3ServiceImpl {

    private final Web3j web3j;

    @Value("${web3.admin.wallet}")
    private String adminWallet;

    @Value("${web3.admin.private-key}")
    private String adminPrivateKey;

    // Bắt buộc phải có địa chỉ của Smart Contract
    @Value("${web3.contract.address}")
    private String contractAddress;

    public Web3ServiceImpl(@Value("${web3.rpc.url}") String rpcUrl) {
        this.web3j = Web3j.build(new HttpService(rpcUrl));
    }

    /**
     * 1. HÀM KIỂM TRA GIAO DỊCH (Khi Khách hàng mua vé qua Smart Contract)
     */
    public boolean verifyContractTransaction(String txHash, BigDecimal expectedAmountBNB) {
        try {
            // Lấy thông tin Chi tiết giao dịch
            Optional<Transaction> txOpt = web3j.ethGetTransactionByHash(txHash).send().getTransaction();
            if (txOpt.isEmpty()) {
                throw new CustomException(400, "Không tìm thấy giao dịch trên Blockchain!");
            }
            Transaction tx = txOpt.get();

            // Lấy Biên lai giao dịch để xem trạng thái thành công hay thất bại
            Optional<TransactionReceipt> receiptOpt = web3j.ethGetTransactionReceipt(txHash).send().getTransactionReceipt();
            if (receiptOpt.isEmpty() || !"0x1".equals(receiptOpt.get().getStatus())) {
                throw new CustomException(400, "Giao dịch đã bị lỗi hoặc đang chờ xác nhận (Pending)!");
            }

            // CHỐT CHẶN 1: Giao dịch có trỏ đúng vào SMART CONTRACT của hệ thống không?
            // (Khi dùng Smart Contract, tiền và lệnh phải gửi vào Contract, không phải gửi vào ví Admin)
            if (tx.getTo() == null || !tx.getTo().equalsIgnoreCase(contractAddress)) {
                throw new CustomException(400, "Cảnh báo gian lận: Giao dịch không tương tác với Smart Contract của hệ thống!");
            }

            // CHỐT CHẶN 2: Có gửi đủ tiền (BNB) vào Contract không?
            // Lưu ý: Nếu team dùng token như USDT (ERC20), logic check tiền sẽ khác.
            // Ở đây vẫn giả định dùng BNB nạp vào Contract.
            BigDecimal actualAmountBNB = Convert.fromWei(tx.getValue().toString(), Convert.Unit.ETHER);
            if (actualAmountBNB.compareTo(expectedAmountBNB) < 0) {
                throw new CustomException(400, "Thanh toán thiếu tiền! Yêu cầu: " + expectedAmountBNB + " BNB, Thực tế gửi: " + actualAmountBNB + " BNB");
            }

            return true;

        } catch (CustomException ce) {
            throw ce;
        } catch (Exception e) {
            throw new CustomException(500, "Lỗi kết nối Web3j: " + e.getMessage());
        }
    }

    /**
     * 2. HÀM HOÀN TIỀN (Backend tự động gọi Smart Contract để trả tiền cho khách)
     */
    public String sendRefund(String toCustomerWallet, BigDecimal amountBNB) {
        try {
            // 1. Nạp Private Key của Admin để có quyền thực thi lệnh trên Contract
            Credentials credentials = Credentials.create(adminPrivateKey);

            // 2. Định nghĩa hàm cần gọi bên trong Smart Contract
            BigInteger amountInWei = Convert.toWei(amountBNB, Convert.Unit.ETHER).toBigInteger();

            // TÊN HÀM: Phải khớp 100% với tên hàm hoàn tiền trong file Solidity của team
            Function function = new Function(
                    "refundTicket",
                    Arrays.asList(
                            new Address(toCustomerWallet), // Tham số 1: Địa chỉ ví khách nhận tiền
                            new Uint256(amountInWei)       // Tham số 2: Số tiền hoàn lại
                    ),
                    Collections.emptyList() // Không cần hứng dữ liệu trả về từ hàm này
            );

            // 3. Mã hóa hàm thành chuỗi Hexa
            String encodedFunction = FunctionEncoder.encode(function);

            // 1. Khai báo Chain ID của Sepolia
            long chainId = 11155111L;

            // 2. Thay vì dùng mặc định, hãy nhét chainId vào đây:
            TransactionManager txManager = new RawTransactionManager(web3j, credentials, chainId);

            // 5. Gửi lệnh thực thi đến Smart Contract
            EthSendTransaction response = txManager.sendTransaction(
                    DefaultGasProvider.GAS_PRICE,
                    DefaultGasProvider.GAS_LIMIT,
                    contractAddress,               // Đích đến là Smart Contract
                    encodedFunction,               // Lệnh thực thi đã mã hóa
                    BigInteger.ZERO                // Không gửi kèm BNB mới, chỉ gọi hàm xử lý logic
            );

            // 6. Kiểm tra xem mạng lưới có từ chối không
            if (response.hasError()) {
                throw new CustomException(500, "Smart Contract từ chối giao dịch: " + response.getError().getMessage());
            }

            // Trả về Transaction Hash để lưu vào DB
            return response.getTransactionHash();

        } catch (Exception e) {
            throw new CustomException(500, "Lỗi khi gọi Smart Contract hoàn tiền: " + e.getMessage());
        }
    }
}