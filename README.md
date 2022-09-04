## generate wasm from go
in go directory, run 
```
 tinygo build -o wasm.wasm -target wasm ./main.go 
```
then put wasm.wasm in src/assets/

`
make sure use the tinygo 0.25.0, this project inline the this version of wasm_exec.js in html already
`