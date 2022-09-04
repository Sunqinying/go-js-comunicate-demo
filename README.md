# what does go-js-msg do?
this repository shows how go invoke js database api method (maybe used for other async function)
# how to start ?
run `yarn install` in the root of the project, then run `yarn serve` to start the project

# how to view the result
open the console see the result, for example, we want to see the funtion invoked by go in main context, add filter `(main go context)`, the result will show as:
```
=> (main go context) invoke init method
=> (main go context) init with respone  {"errCode":0,"errMsg":"","data":"{}"}
=> (main go context) invoke addMessage method
=> (main go context) addMessage with respone  {"errCode":0,"errMsg":"","data":"{\"count\":1}"}
=> (main go context) invoke getMessage method
=> (main go context) getMessage with respone  {"errCode":0,"errMsg":"","data":"{\"client_msg_id\":[\"client_msg_id_123\",\"id_server_001\",\"001\",\"002\",1,\"name\",\"url\",1,1,1,\"msg content 001\",1,1,1,1,1,\"1\",\"1\"]}"}
```

# custom methods
## add js database api
in file `src/index.workder.js`, register custom database method to rpc instance, then in `src/index.js` export this method to window object from rpc instance
## invoke api in go main context
invoke js exported method in go as below:
``` go
wait := make(chan interface{})
fmt.Println("=> (main go context) invoke init method")
js.Global().Call("init").Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
    fmt.Println("=> (main go context) init with respone ", args[0].String())
    wait <- nil
    return nil
}))
<-wait
```
then in go directory, run 
```
 tinygo build -o wasm.wasm -target wasm ./main.go 
```
then put wasm.wasm in src/assets/

`
make sure use the tinygo 0.25.0, this project inline this version of wasm_exec.js in html already
`