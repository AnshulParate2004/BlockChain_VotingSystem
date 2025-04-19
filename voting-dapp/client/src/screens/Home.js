import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Vote from "./Vote";
import Admin from "./Admin";
import ElectionContract from "../contracts/Election.json";
import getWeb3 from "../utils/getWeb3";

export default function Home() {
  const [role, setRole] = useState(2);
  const [web3, setWeb3] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ElectionContract.networks[networkId];
  
      if (!deployedNetwork) {
        console.error("No deployed network found for network ID:", networkId);
        setLoading(false);
        return;
      }
  
      const instance = new web3.eth.Contract(
        ElectionContract.abi,
        deployedNetwork.address
      );
  
      // 🔥 Manually set the voter address here
      const voterAddress = "0x5560022eDa4fB4E3fE4dC0F9e6Fd59866294331E";
  
      setWeb3(web3);
      setCurrentAccount(voterAddress); // Set voter manually
      setContract(instance);
      setLoading(false);
  
      console.log("init");
      console.log("Network ID:", networkId);
      console.log("Deployed Network:", deployedNetwork);
    } catch (error) {
      console.error("Error loading web3 or contract:", error);
      setLoading(false);
    }
  };
  

  const getRole = async () => {
    if (contract && currentAccount) {
      try {
        const user = await contract.methods.getRole(currentAccount).call();
        setRole(parseInt(user));
        console.log("role:", user);
      } catch (error) {
        console.error("Error getting role:", error);
      }
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  useEffect(() => {
    getRole();
  }, [contract, currentAccount]);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        height: "100vh",
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          Loading...
        </Box>
      ) : (
        <Box>
          {role === 1 && (
            <Admin
              role={role}
              contract={contract}
              web3={web3}
              currentAccount={currentAccount}
            />
          )}

          {role === 2 && (
            <Vote
              role={role}
              contract={contract}
              web3={web3}
              currentAccount={currentAccount}
            />
          )}

          {role === 3 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
              }}
            >
              Unauthorized User
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
