const go = new Go();

let wasm;

if ("instantiateStreaming" in WebAssembly) {
  WebAssembly.instantiateStreaming(fetch("/wasm.wasm"), go.importObject).then(
    function (obj) {
      wasm = obj.instance;
      go.run(wasm);
    }
  );
} else {
  fetch("/wasm.wasm")
    .then((resp) => resp.arrayBuffer())
    .then((bytes) =>
      WebAssembly.instantiate(bytes, go.importObject).then(function (obj) {
        wasm = obj.instance;
        go.run(wasm);
      })
    );
}

export default wasm;
