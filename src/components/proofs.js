import { useState, useEffect, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
// import { useAccount, useSignMessage } from "wagmi";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { requestCredentials } from "../utils/secrets";
import {
  getStateAsHexString,
  getDateAsHexString,
  serializeProof,
  poseidonHashQuinary,
  createLeaf,
  onAddLeafProof,
  proofOfResidency,
} from "../utils/proofs";
import { serverAddress } from "../constants/misc";

const LoadingElement = (props) => <h3 style={{ textAlign: "center" }}>Loading...</h3>
const Proofs = () => {
  const params = useParams();
  const [creds, setCreds] = useState();
  const [error, setError] = useState();

  async function addLeaf() {
    // onAddLeafProof
    const oldSecret = creds.secret;
    const newSecret = creds.newSecret;
    const oalProof = await onAddLeafProof(
      serverAddress,
      creds.countryCode,
      creds.subdivisionHex,
      creds.completedAtHex,
      creds.birthdateHex,
      oldSecret,
      newSecret
    );
    console.log("oalProof", oalProof);

    const leaf = await createLeaf(
      serverAddress,
      newSecret,
      creds.countryCode,
      creds.subdivisionHex,
      creds.completedAtHex,
      creds.birthdateHex,
    );

    const { v, r, s } = ethers.utils.splitSignature(creds.signature);
    console.log("v, r, s", v, r, s)

  }
  
  async function handleLobby3Proofs() {
    const oldSecret = creds.secret;
    const newSecret = creds.newSecret;
    const leaf = await createLeaf(
      serverAddress,
      newSecret,
      creds.countryCode,
      creds.subdivisionHex,
      creds.completedAtHex,
      creds.birthdateHex,
    );
    const leavesFromContract = []; // TODO: Get leaves from merkle tree smart contract
    const leaves = [...leavesFromContract, leaf];
    const tree = new IncrementalMerkleTree(poseidonHashQuinary, 14, "0", 5);
    for (const item of leaves) {
      tree.insert(item);
    }
    const index = tree.indexOf(leaf);
    const merkleProof = tree.createProof(index);
    const serializedMerkleProof = serializeProof(merkleProof, poseidonHashQuinary);
    const lob3Proof = await proofOfResidency(
      serverAddress,
      creds.countryCode,
      creds.subdivisionHex,
      creds.completedAtHex,
      creds.birthdateHex,
      newSecret,
      // root,
      serializedMerkleProof[0],
      // leaf,
      serializedMerkleProof[1],
      // path,
      serializedMerkleProof[2],
      // indices
      serializedMerkleProof[3]
    );
    console.log("lob3Proof");
    console.log(lob3Proof);
    // TODO: Call smart contracts
    // contract.updateLeaf(oalProof)
    // contract.proveResidence(lob3Proof)
  }

  useEffect(() => {
    async function init() {
      const c = await requestCredentials();
      console.log("creds", c);
      if (c) {
        setCreds({
          ...c, 
          subdivisionHex : getStateAsHexString(c.subdivision),
          completedAtHex : getDateAsHexString(c.completedAt),
          birthdateHex : getDateAsHexString(c.completedAt)
        });
      } else {
        setError("Could not retrieve credentials for proof. Please make sure you have the Holonym extension installed.");
      }
      console.log("creds", c);
    }
    init();
  }, []);
  useEffect(() => {
    console.log("entered useEffect");
    if (!creds) return;
    const proofType = params.proofType;
    console.log(`proofType: ${proofType}`);
    if (proofType === "lobby3") {
      handleLobby3Proofs();
    } else if (proofType === "addLeaf") {
      addLeaf();
    }
  }, [creds]);

  return (
    <Suspense fallback={<LoadingElement />}>
      {
        true ? <><LoadingElement /><p>Currently, generating a proof may take 10-60s depending on your device</p></> : 
      <div>
        <h3 style={{ textAlign: "center" }}>Generate Proofs</h3>
        <div style={{ maxWidth: "600px", fontSize: "16px" }}>
          <div>
            {error ? (
              <p>Error: {error}</p>
            ) : (
              <p>
                When you see the Holonym popup, please confirm that you would like to
                share your credentials with this web page
              </p>
            )}
          </div>
        </div>
      </div>
      }
    </Suspense>
  );
};

export default Proofs;
