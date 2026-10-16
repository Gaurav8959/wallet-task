import httpStatusCodes from "http-status-codes";
import IController from "../interfaces/IController";
import walletService from "../services/wallet/wallet.service";
import { TTransactionFilter } from "../types/wallet.type";
import ApiResponse from "../utilities/api-response.utility";

const getWriteStatus = (isReplayed: boolean) =>
  isReplayed ? httpStatusCodes.OK : httpStatusCodes.CREATED;

const createWallet: IController = async (req, res) => {
  const wallet = await walletService.createWallet(req.user.id, req.body);
  return ApiResponse.result(res, wallet, httpStatusCodes.CREATED);
};

const deposit: IController = async (req, res) => {
  const result = await walletService.deposit(req.user.id, req.body);
  return ApiResponse.result(res, result, getWriteStatus(result.isReplayed));
};

const transfer: IController = async (req, res) => {
  const result = await walletService.transfer(req.user.id, req.body);
  return ApiResponse.result(res, result, getWriteStatus(result.isReplayed));
};

const balance: IController = async (req, res) => {
  const wallet = await walletService.getBalance(req.user.id);
  return ApiResponse.result(res, wallet, httpStatusCodes.OK);
};

const transactions: IController = async (req, res) => {
  const filter = req.query as unknown as TTransactionFilter;
  const data = await walletService.listTransactions(req.user.id, filter);
  return ApiResponse.result(
    res,
    data.transactions,
    httpStatusCodes.OK,
    null,
    data.pagination
  );
};

const summary: IController = async (req, res) => {
  const data = await walletService.getSummary(req.user.id);
  return ApiResponse.result(res, data, httpStatusCodes.OK);
};

export default {
  createWallet,
  deposit,
  transfer,
  balance,
  transactions,
  summary,
};
