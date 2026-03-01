const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CivicChainRegistry", function () {
  let registry;
  let admin;
  let agency;
  let user;
  let other;

  beforeEach(async function () {
    [admin, agency, user, other] = await ethers.getSigners();

    const CivicChainRegistry = await ethers.getContractFactory("CivicChainRegistry");
    registry = await CivicChainRegistry.deploy();
    
    // Add agency
    await registry.addAgency(agency.address);
  });

  describe("Case Creation", function () {
    it("Should create a case correctly and emit CaseCreated", async function () {
      const tx = await registry.connect(user).createCase(
        ethers.id("filehash"),
        "ipfs://QmTest",
        "Public Works"
      );

      const caseCount = await registry.caseCount();
      expect(caseCount).to.equal(1n);

      const caseData = await registry.cases(1);
      expect(caseData.creator).to.equal(user.address);
      expect(caseData.status).to.equal(0n); // Submitted
    });
  });

  describe("SLA Escalation Logic", function () {
    it("Should NOT allow escalation before SLA deadline", async function () {
      await registry.connect(user).createCase(ethers.id("filehash"), "ipfs://QmTest", "Public Works");

      await expect(
        registry.connect(other).triggerEscalation(1)
      ).to.be.revertedWith("SLA deadline not yet reached");
    });

    it("Should allow ANYONE to escalate after SLA deadline passes without action", async function () {
      await registry.connect(user).createCase(ethers.id("filehash"), "ipfs://QmTest", "Public Works");

      // Advance time by 16 days
      await time.increase(16 * 24 * 60 * 60);

      await expect(registry.connect(other).triggerEscalation(1))
        .to.emit(registry, "PublicEscalationTriggered")
        .withArgs(1n)
        .and.to.emit(registry, "StatusUpdated")
        .withArgs(1n, 3n); // 3 = EscalatedToPublic
        
      const caseData = await registry.cases(1);
      expect(caseData.status).to.equal(3n);
    });
  });
});
