import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import ClipLoader from "react-spinners/ClipLoader";

const Leaderboard = dynamic(() => import("../components/Leaderboard"));

import Layout from "../components/Layout";
import Web3 from "web3";
import tokenABI from "../lib/tokenABI";
import { useState } from "react";
import { AccountType } from "../interfaces";
// import { users } from "../data/users";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lplukctgmlugrzodcbkx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTI0NzU0NiwiZXhwIjoxOTU2ODIzNTQ2fQ.aMatDY5HWuAKNkm_i__Jkud5_gUYL1bDDA85PWEwFb4"
);

const tokenAddresses = [
  {
    address: "0xd5003296ac2c09d8fabb412ba1a2cdf50d959496",
    token: "LC",
  },
];

const ALLOWED_NETWORK = "rinkeby";

const IndexPage = () => {
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [web3Enabled, setWeb3Enabled] = useState(false);
  const [isLoadingLeaderboard, setLoadingLeaderBoard] = useState(false);

  useEffect(() => {
    if ((window as any).ethereum) {
      setWeb3Enabled(true);
    } else {
      window.alert("Please install Metamask");
    }
  }, []);

  const loadBlockchainData = async () => {
    // Empty web3 instance
    let web3: Web3 = new Web3();

    if (web3Enabled) {
      web3 = new Web3((window as any).ethereum);
      const netId = await web3.eth.net.getNetworkType();

      if (netId !== ALLOWED_NETWORK) {
        window.alert("Please change into Rinkeby Network on Metamask");
        return;
      }

      const accs = await web3.eth.getAccounts();      

      const newAccounts = await Promise.all(
        accs.map(async (address: string) => {
          const balance = await web3.eth.getBalance(address);

          const tokenBalances = await Promise.all(
            tokenAddresses.map(async (token) => {
              const tokenInst = new web3.eth.Contract(tokenABI, token.address);

              const balance = await tokenInst.methods.balanceOf(address).call();

              const promises: any[] = [];

              setLoadingLeaderBoard(true);

              const {data:users, error:err} = await supabase.from('users').select('name, address')
              if(err){
                console.log(err)
              }
              if(!users){
                window.alert('no users')
                return
              }
              users.forEach((u) => {
                const promise = tokenInst.methods.balanceOf(u.address).call();
                promises.push(promise);
              });

              const balances = await Promise.all(promises);
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
        <div className="actions">
          
          </div>
      )}

      {accounts && accounts.length > 0 && !isLoadingLeaderboard && (
        <div className="accounts">
          {accounts.map((account) => {
            return (
              <div className="account" key={account.address}>
                <Leaderboard account={account} />
              </div>
            );
          })}
        </div>
      )}

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

        button {
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
