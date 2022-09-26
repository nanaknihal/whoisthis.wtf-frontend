import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { storeCredentials, getIsHoloRegistered } from "../utils/secrets";
import { zkIdVerifyEndpoint } from "../constants/misc";
import { useNavigate } from "react-router-dom";

const instructionStyles = {
  marginBottom: "10px",
  fontSize: "16px",
  fontFamily: "Montserrat, sans-serif",
  lineHeight: "1.5",
};

// NOTE: this signature is invalid because the credentials were changed to test later steps
const testCreds = {"countryCode":0,"subdivision":"CA","completedAt":"06-09-1969","birthdate":"09-06-1996","secret":"0x89e0bc2174cb908298ce2f38987995a1","signature":"0x6440eb3b1871fa0e5ad052b81fb6cfe570b8ec74e753c45462778ef5f3302e17071cf538fa78d7c99a2c98e370f7d85ff82942364e8110f2960caf51819128c71b"}; 

// Display success message, and retrieve user credentials to store in browser
const Verified = () => {
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const [registered, setRegistered] = useState(false);
  const [creds, setCreds] = useState();
  const navigate = useNavigate();

  async function getCredentials() {
    console.log("TEMP SEC", localStorage.getItem("holoTempSecret"))
    if (!localStorage.getItem("holoTempSecret")) {
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const secret = localStorage.getItem("holoTempSecret");
      const resp = await fetch(
        `${zkIdVerifyEndpoint}/register/credentials?secret=${secret}`
      );
      // Shape of data == { user: completeUser }
      const data = await resp.json();
      if (data.error) {
        setError(data.error);
      } else {
        setLoading(false);
        const credsTemp = data.user;
        setCreds(credsTemp);
        localStorage.removeItem("holoTempSecret");
        return credsTemp;
      }
    } catch (err) {
      console.log(err);
      setError(`Error: ${err.message}`);
    }
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function waitForUserRegister() {
    let isRegistered = await getIsHoloRegistered();
    while (!isRegistered) {
      await sleep(100);
      isRegistered = await getIsHoloRegistered();
    }
  }

  useEffect(() => {
    // For testing
    // storeCredentials(testCreds);

    async function func() {
      const isRegistered = await getIsHoloRegistered();
      // Only setRegistered at this first check. If user had not registered before
      // reaching this page, we want to keep on the page the instructions for the
      // non-registered user
      setRegistered(isRegistered);
      if (!isRegistered) {
        await waitForUserRegister();
        setError(undefined);
      }
      const credsTemp = await getCredentials();
      console.log("creds temp", JSON.stringify(credsTemp));
      await storeCredentials(process?.env?.NODE_ENV === "development" ? testCreds : credsTemp);
    }
    try {
      func().then(x=>navigate('/zk-id/addLeaf'));
    } catch (err) {
      console.log(err);
      setError(`Error: ${err.message}`);
    }
  }, []);

  return (
    <>
      {error ? (
        <p>{error}</p>
      ) : loading ? (
        <h3 style={{ textAlign: "center" }}>Loading...</h3>
      ) : (
        <div>
          <h3 style={{ textAlign: "center" }}>Almost finished!</h3>
          <br />
          <div style={{ maxWidth: "600px", fontSize: "16px" }}>
            <i>
              <ol>
                {!registered && (
                  <li>
                    <p>
                      Open the Holonym extension, and create an account by entering a
                      password (be sure to remember it)
                    </p>
                  </li>
                )}
                <li>
                  <p>
                    Login to the Holonym popup{" "}
                    {!registered && "(after creating an account)"}
                  </p>
                </li>
                <p>
                  <li>Confirm your credentials</li>
                </p>
              </ol>
            </i>
            <br />
            <h4>The Holonym extension will then store your encrypted credentials.</h4>
          </div>
        </div>
      )}
    </>
  );
};

export default Verified;