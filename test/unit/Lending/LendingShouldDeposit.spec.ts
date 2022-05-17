import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const shouldDeposit = (): void => {
  //   // to silent warning for duplicate definition of Transfer event
  //   ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

  context(`#deposit`, async function () {
    it(`should revert if the account is not greater than zero`, async function () {
      const amount = ethers.constants.Zero;

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith("NeedsMoreThanZero");
    });

    it(`should emit the proper event`, async function () {
      const amount: BigNumber = ethers.constants.One;

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      )
        .to.be.emit(this.lending, "Deposit")
        .withArgs(
          this.signers.alice.address,
          this.mocks.mockUsdc.address,
          amount
        );
    });

    it(`should update the storage variable properly`, async function () {
      const previousAccountsToTokenDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );

      const amount = parseEther("1");

      await this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);

      const currentAccountsToTokenDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );

      assert(
        currentAccountsToTokenDeposits.toBigInt() ===
          previousAccountsToTokenDeposits.add(amount).toBigInt(),
        "New value should equal previous plus amount"
      );
    });

    it(`should revert with transferfailed event`, async function () {
      await this.mocks.mockUsdc.mock.transferFrom.returns(false);

      const amount: BigNumber = parseEther("1");

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith("TransferFailed");
    });
  });
};
