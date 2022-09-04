import { initBackend } from "absurd-sql/dist/indexeddb-main-thread";
import { RPCMessageEvent, RPC } from "rpc-shooter";
import "./go";

function init() {
  let worker = new Worker(new URL("./index.worker.js", import.meta.url));
  // This is only required because Safari doesn't support nested
  // workers. This installs a handler that will proxy creating web
  // workers through the main thread
  initBackend(worker);

  const rpc = new RPC({
    event: new RPCMessageEvent({
      currentEndpoint: worker,
      targetEndpoint: worker,
    }),
  });

  return rpc;
}

const rpc = init();

// register method on window for go wasm invoke
window.init = async () => {
  console.info("=> (invoked by go wasm) run init method");

  const response = await rpc.invoke("init");

  console.info(
    "=> (invoked by go wasm) run init method with response ",
    JSON.stringify(response)
  );

  return JSON.stringify(response);
};
window.addMessage = async (msg) => {
  console.info("=> (invoked by go wasm) run addMessage method with msg ", msg);

  const response = await rpc.invoke("addMessage", JSON.parse(msg));

  console.info(
    "=> (invoked by go wasm) run addMessage method with response ",
    JSON.stringify(response)
  );

  return JSON.stringify(response);
};
window.getMessage = async (client_msg_id) => {
  console.info(
    "=> (invoked by go wasm) run getMessage method with client_msg_id ",
    client_msg_id
  );

  const response = await rpc.invoke("getMessage", client_msg_id);

  console.info(
    `=> (invoked by go wasm) run getMessage method with client_msg_id=${client_msg_id}  with response `,
    JSON.stringify(response)
  );

  return JSON.stringify(response);
};

// run to test comunication logic
const runByJs = async () => {
  try {
    // init table
    const initResponse = await rpc.invoke("init");
    console.info(
      "(js) => run init method with response ",
      JSON.stringify(initResponse)
    );

    // add message
    const client_msg_id = `id_msg_${Math.ceil(Math.random() * 1000000000000)}`;
    const messageResponse = await rpc.invoke("addMessage", {
      client_msg_id,
      server_msg_id: "id_server_001",
      send_id: "001",
      recv_id: "002",
      sender_platform_id: 1,
      sender_nick_name: "name",
      sender_face_url: "url",
      session_type: 1,
      msg_from: 1,
      content_type: 1,
      content: "msg content 001",
      is_read: 1,
      status: 1,
      seq: 1,
      send_time: 1,
      create_time: 1,
      attached_info: "1",
      ex: "1",
    });
    console.info(
      `(js) => run addMessage method with client_msg_id=${client_msg_id} and with response `,
      JSON.stringify(messageResponse)
    );

    const message = await rpc.invoke("getMessage", client_msg_id);
    console.info(
      `(js) => run getMessage method with client_msg_id=${client_msg_id}  with response `,
      JSON.stringify(message)
    );
  } catch (err) {
    console.error(err);
  }
};
// runByJs();
