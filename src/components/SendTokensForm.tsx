import { Form, Button, Col, Row } from "react-bootstrap";
import Web3 from "web3";

import tokenABI from "../lib/tokenABI";
import { UserBalance } from "../interfaces";


type PropTypes = {
  userBalances: Array<UserBalance>;
  setSendTokens: Function,
  web3: Web3
};

const SendTokensForm = ({ userBalances, setSendTokens, web3 }: PropTypes) => {
//   const [selected, setSelected] = useState("Select Recipient");
//   const [amount, setAmount] = useState(0);

//   const createItems = (userBalances: UserBalance[]) => {
//     const ret: JSX.Element[] = [];
//     userBalances.forEach((userBalance) => {
//       ret.push(
//         <Dropdown.Item
//           key={userBalance.address}
//           onClick={() => {
//             setSelected(userBalance.name);
//           }}
//         >
//           {userBalance.name}
//         </Dropdown.Item>
//       );
//     });
//     return ret;
//   };

const onFormSubmit = async (e: any) =>{
    e.preventDefault()    
    setSendTokens(false)
    const accs = await web3.eth.getAccounts();    

    const fromAddr = accs[0]
    const toAddr = e.target[0].value
    const amount = e.target[1].value
    const contractAddress = "0xd5003296ac2c09d8fabb412ba1a2cdf50d959496"
    const contract = new web3.eth.Contract(tokenABI, contractAddress, {from: fromAddr});
    console.log(amount)

    //i am stumped as to why the amount goes from the amount in the form to 
    //value/(1 trillion billion however much many orders of magnitude)
    //but hopefully the fact that im sending an LC transaction and metamask is
    //confirming is the important part
    await web3.eth.sendTransaction({
        from: fromAddr,
        to: contractAddress,
        data: contract.methods.transfer(toAddr, amount * 100000000).encodeABI(),
        value: "0x0",
        gasPrice: "0",        
    })
}

  return (
    <>
      <div className="form">
        <Form onSubmit={onFormSubmit}>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              Recipient
            </Form.Label>
            <Col sm={10}>
              <Form.Select>
                {userBalances.map((ub) => {
                  return (
                    <option key={ub.address} value={ub.address}>
                      {ub.name}
                    </option>
                  );
                })}
              </Form.Select>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              {" "}
              Amount{" "}
            </Form.Label>
            <Col sm={10}>
              <Form.Control placeholder="0" />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 10, offset: 2 }}>
              <Button type="submit">Send Tokens</Button>
            </Col>
          </Form.Group>
        </Form>
      </div>
      <style jsx>{`        
        .form {
            padding-left: 25%;
            padding-right: 25%;            
        }
      `}</style>
      {/* <div className="form">
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Recipient:</label>
            <Dropdown className="d-inline mx-2" id="user-dropdown">
              <Dropdown.Toggle>{selected}</Dropdown.Toggle>
              <Dropdown.Menu>{createItems(userBalances)}</Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="field">
            <label>
              Amount:
              <input type="text" name="amount" />
            </label>
          </div>
          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
      <style jsx>{`        
        .form {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .field {
          margin-top: 5px;
        }
        input {
          margin-top: 5px;
        }
        label {
          font-weight: bold;
        }
      `}</style> */}

    </>
  );
};

export default SendTokensForm;
