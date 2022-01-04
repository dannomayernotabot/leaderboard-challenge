import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import ClipLoader from "react-spinners/ClipLoader";
import { cloneDeep } from "lodash";

const Account = dynamic(() => import("../components/Leaderboard"));

import Layout from "../components/Layout";
import Web3 from "web3";
import tokenABI from "../lib/tokenABI";
import { useState } from "react";
import { AccountType, UserBalance } from "../interfaces";
import supabase from "../database";
import Form from "../components/Form";

const tokenAddresses = [
  {
    address: "0xd5003296ac2c09d8fabb412ba1a2cdf50d959496",
    token: "LC",
  },
];

const ALLOWED_NETWORK = "rinkeby";

let web3: Web3 = new Web3();

const IndexPage = () => {
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [web3Enabled, setWeb3Enabled] = useState(false);
  const [isLoadingLeaderboard, setLoadingLeaderBoard] = useState(false);
  const [isAddPeer, setAddPeer] = useState(false);
  const [users, setUsers] = useState<UserBalance[]>([]);

  useEffect(() => {
    if ((window as any).ethereum) {
      setWeb3Enabled(true);
      web3 = new Web3((window as any).ethereum);
    } else {
      window.alert("Please install Metamask");
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: users, error } = await supabase
        .from("users")
        .select("name, address");

      if (error) {
        //probably want to use whatever logging service is in place rather than console irl
        console.log(error);
        return;
      }

      if (users) {
        setUsers(users);
      }
    };
    fetchUsers();
  }, []);

  const loadBlockchainData = async () => {
    if (web3Enabled) {
      const netId = await web3.eth.net.getNetworkType();

      if (netId !== ALLOWED_NETWORK) {
        window.alert("Please change into Rinkeby Network on Metamask");
        return;
      }

      const accs = await web3.eth.getAccounts();

      const newAccounts = await Promise.all(
        accs.map(async (address: string) => {
          const balance = await web3.eth.getBalance(address);          
          console.log(balance)
          console.log(address)
          const tokenBalances = await Promise.all(
            tokenAddresses.map(async (token) => {
              console.log(token.address)
              const tokenInst = new web3.eth.Contract(tokenABI, token.address);

              const balance = await tokenInst.methods.balanceOf(address).call();
              console.log(balance)
              console.log(address)
              const promises: any[] = [];

              setLoadingLeaderBoard(true);

              users.forEach((u) => {
                const promise = tokenInst.methods.balanceOf(u.address).call();
                promises.push(promise);
              });

              const balances = await Promise.all(promises);
              console.log(balances)
              const mappedBalance = balances.map((b, i) => {
                return {
                  name: users[i].name,
                  address: users[i].address,
                  balance: Number(web3.utils.fromWei(b, "ether")),
                };
              });
              mappedBalance.sort((a, b) => b.balance - a.balance);

              setLoadingLeaderBoard(false);

              return {
                token: token.token,
                balance: Number(web3.utils.fromWei(balance, "ether")),
                userBalances: mappedBalance,
              };
            })
          );

          return {
            address,
            balance: Number(web3.utils.fromWei(balance, "ether")),
            tokens: tokenBalances,
          };
        })
      );
      setAccounts(newAccounts);
    } else {
      window.alert("Please install Metamask");
    }
  };

  const loginToMetaMask = async () => {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    loadBlockchainData();
    setWeb3Enabled(true);
  };

  const addPeer = async (event: any) => {
    setAddPeer(false);
    const address = event.target.elements.Address.value;
    const name = event.target.elements.Name.value;
    //the db enforces unique address as well, but better performance to check here
    if (web3.utils.isAddress(address)) {
      if (users.find((user) => user.address == address)) {
        window.alert("user with this address already exists");
        return;
      }
      //look for it but default if you dont find it
      let lc = tokenAddresses.find(ta => ta.token === 'LC')
      if(!lc){
        lc = {
          address: "0xd5003296ac2c09d8fabb412ba1a2cdf50d959496",
          token: "LC",
        }
      }       
      const tokenInst = new web3.eth.Contract(tokenABI, lc.address);
      const balance = await tokenInst.methods.balanceOf(address).call();

      await supabase.from("users").insert([
        {
          name: name,
          address: address,
        },
      ]);
      const newAccounts = cloneDeep(accounts);
      //todo this should probably be dynamic or at least check the token is LC
      newAccounts[0].tokens[0].userBalances.push({
        name,
        address,
        balance: Number(web3.utils.fromWei(balance, "ether")),
      });
      setAccounts(newAccounts);
    } else {
      window.alert("invalid address");
    }
  };

  return (
    <Layout title="🏦 $LC Token 🏦">
      <h1>🏦 $LC Token 🏦</h1>

      {web3Enabled && accounts.length === 0 && (
        <div className="actions">
          <button className="actions" onClick={loginToMetaMask}>
            Must hold 50 $LC to unlock
          </button>
        </div>
      )}

      {!web3Enabled && (
        <div className="actions">
          <a href="https://metamask.io/download.html" target="_blank">
            Install Metamask
          </a>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ClipLoader color="black" loading={isLoadingLeaderboard} size={40} />
      </div>

      {accounts && accounts.length > 0 && !isLoadingLeaderboard && (
        <div className="actions"></div>
      )}

      {accounts &&
        accounts.length > 0 &&
        users &&
        users.length > 0 &&
        !isLoadingLeaderboard &&
        !isAddPeer && (
          <div>
            <div className="actions">
              <button className="actions" onClick={() => setAddPeer(true)}>
                Add Peer
              </button>
            </div>
            <div className="accounts">
              {accounts.map((account) => {
                return (
                  <div className="account" key={account.address}>
                    <Account account={account} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {isAddPeer && <Form fields={["Name", "Address"]} onSubmit={addPeer} />}

      <style jsx global>
        {`
          body {
            padding: 0;
            margin: 0;
          }
        `}
      </style>
      <style jsx>{`
        h1 {
          font-size: 60px;
          text-align: center;
          font-family: "Recoleta Regular DEMO";
        }

        .actions {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          border-radius: 10px;
          font-family: "Recoleta Regular DEMO";
          font-size: 20px;
        }

        .addPeerForm {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          font-family: "Recoleta Regular DEMO";
          font-size: 20px;
        }

        .warning {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          color: red;
          font-family: "Recoleta Regular DEMO";
        }

        .leaderboard {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          color: black;
          font-family: "Recoleta Regular DEMO";
        }

        .play {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 30px;
          color: black;
          font-family: "Recoleta Regular DEMO";
        }

        .3d-scene {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          color: red;
        }

        button,
        .submit {
          background: black;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 15px;
          cursor: pointer;
          font-family: "Recoleta Regular DEMO";
        }

        .account {
          margin: 5px;
          font-family: "Recoleta Regular DEMO";
          margin-bottom: 100px;
        }
      `}</style>
    </Layout>
  );
};

export default IndexPage;
