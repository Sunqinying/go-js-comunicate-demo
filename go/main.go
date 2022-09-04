package main

import (
	"fmt"
	"syscall/js"
)

// This calls a JS function from Go.
func main() {
	wait := make(chan interface{})
	fmt.Println("=> (main go context) invoke init method")
	js.Global().Call("init").Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Println("=> (main go context) init with respone ", args[0].String())
		wait <- nil
		return nil
	}))
	<-wait

	wait = make(chan interface{})
	fmt.Println("=> (main go context) invoke addMessage method")
	js.Global().Call("addMessage", `{"client_msg_id":"client_msg_id_123","server_msg_id":"id_server_001","send_id":"001","recv_id":"002","sender_platform_id":1,"sender_nick_name":"name","sender_face_url":"url","session_type":1,"msg_from":1,"content_type":1,"content":"msg content 001","is_read":1,"status":1,"seq":1,"send_time":1,"create_time":1,"attached_info":"1","ex":"1"}`).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Println("=> (main go context) addMessage with respone ", args[0].String())
		wait <- nil
		return nil
	}))
	<-wait

	wait = make(chan interface{})
	fmt.Println("=> (main go context) invoke getMessage method")
	js.Global().Call("getMessage", "client_msg_id_123").Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Println("=> (main go context) getMessage with respone ", args[0].String())
		wait <- nil
		return nil
	}))
	<-wait
}
