import initSqlJs from "@jlongster/sql.js";
import { SQLiteFS } from "absurd-sql";
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend";
import { RPCMessageEvent, RPC } from "rpc-shooter";

async function InitializeDB() {
  let SQL = await initSqlJs({ locateFile: (file) => file });
  let sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir("/sql");
  SQL.FS.mount(sqlFS, {}, "/sql");

  let db = new SQL.Database("/sql/db.sqlite", { filename: true });
  db.exec(`
    PRAGMA page_size=8192;
    PRAGMA journal_mode=MEMORY;
  `);
  return db;
}

const instance = new Promise((resolve, reject) => {
  const db = InitializeDB();
  db.then((res) => resolve(res)).catch((err) => reject(err));
});

async function init() {
  const db = await instance;
  const result = {
    errCode: 0,
    errMsg: "",
    data: "{}",
  };

  try {
    db.exec(
      `
        CREATE TABLE IF NOT EXISTS 'local_chat_logs' (
          'client_msg_id' char(64),
          'server_msg_id' char(64),
          'send_id' char(64),
          'recv_id' char(64),
          'sender_platform_id' integer,
          'sender_nick_name' varchar(255),
          'sender_face_url' varchar(255),
          'session_type' integer,
          'msg_from' integer,
          'content_type' integer,
          'content' varchar(1000),
          'is_read' numeric,
          'status' integer,
          'seq' integer DEFAULT 0,
          'send_time' integer,
          'create_time' integer,
          'attached_info' varchar(1024),
          'ex' varchar(1024),
          PRIMARY KEY ('client_msg_id'))
        `
    );

    return result;
  } catch (e) {
    result.errCode = -1;
    result.errMsg;

    console.error(e);
  }

  return result;
}

async function addMessage(message) {
  const db = await instance;
  const result = {
    errCode: 0,
    errMsg: "",
    data: "{}",
  };

  try {
    db.exec(`
    INSERT INTO 'local_chat_logs' (
        client_msg_id,
        server_msg_id,
        send_id,
        recv_id,
        sender_platform_id,
        sender_nick_name,
        sender_face_url,
        session_type,
        msg_from,
        content_type,
        content,
        is_read,
        status,
        seq,
        send_time,
        create_time,
        attached_info,
        ex
      ) VALUES (
        '${message.client_msg_id}',
        '${message.server_msg_id}',
        '${message.send_id}',
        '${message.recv_id}',
        ${message.sender_platform_id},
        '${message.sender_nick_name}',
        '${message.sender_face_url}',
        ${message.session_type},
        ${message.msg_from},
        ${message.content_type},
        '${message.content}',
        ${message.is_read},
        ${message.status},
        ${message.seq},
        ${message.send_time},
        ${message.create_time},
        ${message.attached_info},
        '${message.ex}'
      )
    `);
    result.data = JSON.stringify({ count: 1 });

    return result;
  } catch (e) {
    result.errCode = -1;
    result.errMsg = `${e}`;
  }

  return result;
}

async function getMessage(client_msg_id) {
  const db = await instance;
  const result = {
    errCode: 0,
    errMsg: "",
    data: "{}",
  };

  try {
    const row = db.exec(`
        SELECT * FROM 'local_chat_logs' WHERE client_msg_id='${client_msg_id}'
    `);

    if (row.length !== 0) {
      result.data = JSON.stringify(convertToJSONRecord(row[0]));
    }

    return result;
  } catch (e) {
    result.errCode = -1;
    result.errMsg;

    console.error(e);
  }

  return result;
}

const ctx = self;
const rpc = new RPC({
  event: new RPCMessageEvent({
    currentEndpoint: ctx,
    targetEndpoint: ctx,
  }),
});

rpc.registerMethod("init", init);
rpc.registerMethod("addMessage", addMessage);
rpc.registerMethod("getMessage", getMessage);

function convertToJSONRecord(row) {
  const record = {};
  row.columns.forEach((k, index) => {
    record[k] = row.values[index];
  });

  return record;
}
