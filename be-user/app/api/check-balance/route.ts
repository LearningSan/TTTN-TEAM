/**
 * @swagger
 * /api/check-balance:
 *   post:
 *     summary: Kiểm tra số dư ví và khả năng thanh toán (balance + gas)
 *     tags:
 *       - Payment
 *
 *     description: |
 *       ## 💰 CHECK BALANCE (PRE-PAYMENT)
 *
 *       API này dùng để kiểm tra ví người dùng có đủ ETH để thực hiện giao dịch hay không.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from_wallet
 *               - amount
 *             properties:
 *               from_wallet:
 *                 type: string
 *                 example: "0xabc123..."
 *                 description: Địa chỉ ví gửi (MetaMask)
 *
 *               amount:
 *                 type: string
 *                 example: "10000000000000000"
 *                 description: Số tiền cần thanh toán (đơn vị wei)
 *
 *     responses:
 *       200:
 *         description: Kiểm tra thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               balance: "500000000000000000"
 *               gas_price: "1000000000"
 *               gas_cost: "21000000000000"
 *               total_required: "10021000000000000"
 *               has_enough_balance: true
 *
 *       400:
 *         description: Thiếu dữ liệu đầu vào
 *
 *       500:
 *         description: Lỗi server hoặc không kết nối được blockchain
 */
import { NextResponse } from "next/server";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from_wallet, amount } = body;

    if (!from_wallet || !amount) {
      return NextResponse.json(
        { message: "from_wallet and amount required" },
        { status: 400 }
      );
    }

    const balance = await provider.getBalance(from_wallet);

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice ?? BigInt(1000000000); // fallback 1 gwei

    const gasLimit = BigInt(21000);

    const gasCost = gasPrice * gasLimit;

    const totalRequired = BigInt(amount) + gasCost;

    const hasEnough = balance >= totalRequired;

    return NextResponse.json({
      success: true,
      balance: balance.toString(),
      gas_price: gasPrice.toString(),
      gas_cost: gasCost.toString(),
      total_required: totalRequired.toString(),
      has_enough_balance: hasEnough
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}