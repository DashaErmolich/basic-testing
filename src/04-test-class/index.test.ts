import {
  BankAccount,
  InsufficientFundsError,
  SynchronizationFailedError,
  TransferFailedError,
  getBankAccount,
} from '.';

import lodash from 'lodash';

describe('BankAccount', () => {
  let bankAccount: BankAccount;
  let toBankAccount: BankAccount;

  const MOCK_BANK_BALANCE = {
    INIT: 50,
    GREATER_THEN_AVAILABLE: 600,
  };
  const MOCK_TO_BANK_BALANCE = {
    INIT: 65,
  };

  const OPERATION_VALUE = 10;

  const FETCH_BALANCE = 300;

  beforeEach(() => {
    bankAccount = getBankAccount(MOCK_BANK_BALANCE.INIT);
    toBankAccount = getBankAccount(MOCK_TO_BANK_BALANCE.INIT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create account with initial balance', () => {
    const initBalance = bankAccount.getBalance();

    expect(bankAccount).toBeInstanceOf(BankAccount);
    expect(initBalance).toBe(MOCK_BANK_BALANCE.INIT);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    expect(() =>
      bankAccount.withdraw(MOCK_BANK_BALANCE.GREATER_THEN_AVAILABLE),
    ).toThrowError(InsufficientFundsError);
  });

  test('should throw error when transferring more than balance', () => {
    expect(() =>
      bankAccount.transfer(
        MOCK_BANK_BALANCE.GREATER_THEN_AVAILABLE,
        toBankAccount,
      ),
    ).toThrowError(InsufficientFundsError);
  });

  test('should throw error when transferring to the same account', () => {
    toBankAccount = bankAccount;
    expect(() =>
      bankAccount.transfer(OPERATION_VALUE, toBankAccount),
    ).toThrowError(TransferFailedError);
  });

  test('should deposit money', () => {
    const balanceAfterDeposit = bankAccount
      .deposit(OPERATION_VALUE)
      .getBalance();
    expect(balanceAfterDeposit).toBe(MOCK_BANK_BALANCE.INIT + OPERATION_VALUE);
  });

  test('should withdraw money', () => {
    const balanceAfterWithdraw = bankAccount
      .withdraw(OPERATION_VALUE)
      .getBalance();
    expect(balanceAfterWithdraw).toBe(MOCK_BANK_BALANCE.INIT - OPERATION_VALUE);
  });

  test('should transfer money', () => {
    const transferSpy = jest.spyOn(bankAccount, 'transfer');
    const withdrawSpy = jest.spyOn(bankAccount, 'withdraw');
    const depositSpy = jest.spyOn(toBankAccount, 'deposit');

    const transferValue = OPERATION_VALUE;

    const bankAccountBalanceAfterTransfer = bankAccount
      .transfer(transferValue, toBankAccount)
      .getBalance();
    const toBankAccountBalanceAfterTransfer = toBankAccount.getBalance();

    expect(transferSpy).toBeCalledTimes(1);
    expect(transferSpy).toHaveBeenCalledWith(transferValue, toBankAccount);

    expect(withdrawSpy).toBeCalledTimes(1);
    expect(withdrawSpy).toHaveBeenCalledWith(transferValue);

    expect(depositSpy).toBeCalledTimes(1);
    expect(depositSpy).toHaveBeenCalledWith(transferValue);

    expect(bankAccountBalanceAfterTransfer).toBe(
      MOCK_BANK_BALANCE.INIT - transferValue,
    );
    expect(toBankAccountBalanceAfterTransfer).toBe(
      MOCK_TO_BANK_BALANCE.INIT + transferValue,
    );
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    const notFailCondition = 1;

    const lodashRandomSpy = jest.spyOn(lodash, 'random');

    lodashRandomSpy.mockReturnValueOnce(FETCH_BALANCE);
    lodashRandomSpy.mockReturnValueOnce(notFailCondition);

    const fetchedBalance = await bankAccount.fetchBalance();

    expect(lodashRandomSpy).toBeCalledTimes(2);

    expect(typeof fetchedBalance).toBe('number');
  });

  test('should set new balance if fetchBalance returned number', async () => {
    const fetchBalanceSpy = jest.spyOn(bankAccount, 'fetchBalance');

    fetchBalanceSpy.mockResolvedValueOnce(FETCH_BALANCE);

    await bankAccount.synchronizeBalance();

    const balanceAfterFetch = bankAccount.getBalance();

    expect(fetchBalanceSpy).toBeCalledTimes(1);

    expect(balanceAfterFetch).toBe(FETCH_BALANCE);
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    const fetchBalanceSpy = jest.spyOn(bankAccount, 'fetchBalance');

    fetchBalanceSpy.mockResolvedValueOnce(null);

    await expect(bankAccount.synchronizeBalance()).rejects.toThrowError(
      SynchronizationFailedError,
    );

    expect(bankAccount.getBalance()).toBe(MOCK_BANK_BALANCE.INIT);
  });
});
