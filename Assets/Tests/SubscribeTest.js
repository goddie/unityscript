#pragma strict

import System;
import System.Collections.Generic;
import Pathfinding.Serialization.JsonFx;
import System.Xml;

public class CustomClass
{
	var foo:String = "hi!";
	var bar:int[] = [1,2,3,4,5];
}

@Serializable
class PubnubDemoObject
{
	var VersionID:double = 3.4;
	var Timetoken:long = 13601488652764619;
	var OperationName:String = "Publish";
	var Channels:String[]  = [ "ch1" ];
	var DemoMessage:PubnubDemoMessage = new PubnubDemoMessage ();
	var CustomMessage:PubnubDemoMessage = new PubnubDemoMessage ("This is a demo message");
	var SampleXml:XmlDocument = new PubnubDemoMessage ().TryXmlDemo ();
}

@Serializable
class PubnubDemoMessage
{
	var DefaultMessage:String = "~!@#$%^&*()_+ `1234567890-= qwertyuiop[]\\ {}| asdfghjkl;' :\" zxcvbnm,./ <>? ";

	function PubnubDemoMessage ()
	{
	}
	
	function PubnubDemoMessage (message:String)
	{
		DefaultMessage = message;
	}

	function TryXmlDemo():XmlDocument
	{
		var xmlDocument:XmlDocument = new XmlDocument ();
		xmlDocument.LoadXml ("<DemoRoot><Person ID='ABCD123'><Name><First>John</First><Middle>P.</Middle><Last>Doe</Last></Name><Address><Street>123 Duck Street</Street><City>New City</City><State>New York</State><Country>United States</Country></Address></Person><Person ID='ABCD456'><Name><First>Peter</First><Middle>Z.</Middle><Last>Smith</Last></Name><Address><Street>12 Hollow Street</Street><City>Philadelphia</City><State>Pennsylvania</State><Country>United States</Country></Address></Person></DemoRoot>");

		return xmlDocument;
	}
}

//Connect and AlreadySubscribed unit tests
//Emoji

class SubscribeTest extends MonoBehaviour{

	var pubkey = 'demo-36';
	var subkey = 'demo-36';
	var seckey = 'demo-36';
	var secure = false;
	var channel = 'mainchat';
	var channel2 = 'mainchat2';
	var cipher = '';
	var pubnub: PubNub;

	var errorResponse:String;
	var deliveryStatus:boolean;
	var response:Array;
	var mode:int=0;
	
	function Start(){
		response = null;
		deliveryStatus = false;
		errorResponse = null;
		pubnub = gameObject.AddComponent(PubNub);
		var uuid = "SubscribeTest";
		pubnub.Init(pubkey, subkey, seckey, cipher, "", secure);
		pubnub.disableHeartbeat = true;
		if(mode == 9){
			StartCoroutine(pubnub.Subscribe(channel, false, "", ParseResponseConnected, ParseResponseDummy));
		} else {
			StartCoroutine(pubnub.Subscribe(channel, false, "", ParseResponse, ParseResponseDummy));
		}
		yield WaitForSeconds(5);
		
		if(mode == 0){
			var messageToSend = new Hashtable();
			messageToSend["username"] = "username";
			messageToSend["message"] = "message";
			StartCoroutine(pubnub.Publish(channel, messageToSend, false, ParseResponseDummy));
		} else if (mode == 1){
			var messageToSend1 = new CustomClass ();
			StartCoroutine(pubnub.Publish(channel, messageToSend1, false, ParseResponseDummy));
		} else if (mode == 2){
			var messageToSend2 = new PubnubDemoObject ();
			StartCoroutine(pubnub.Publish(channel, messageToSend2, false, ParseResponseDummy));
		} else if (mode == 3){
			var messageToSend3 = "/";
			StartCoroutine(pubnub.Publish(channel, messageToSend3, false, ParseResponseDummy));
		} else if (mode == 4){
			var messageToSend4 = "\"'";
			StartCoroutine(pubnub.Publish(channel, messageToSend4, false, ParseResponseDummy));
		/*} else if (mode == 5){
			var messageToSend5 = "'";
			StartCoroutine(pubnub.Publish(channel, messageToSend5, false, ParseResponseDummy));*/
		} else if (mode == 6){
			var messageToSend6 = "Text with 😜 emoji 🎉.";
			StartCoroutine(pubnub.Publish(channel, messageToSend6, false, ParseResponseDummy));
		} else if (mode == 7){
			var messageToSend7 = "Text with ÜÖ漢語";
			StartCoroutine(pubnub.Publish(channel, messageToSend7, false, ParseResponseDummy));
		} else if (mode == 8){
			StartCoroutine(pubnub.Subscribe(channel, false, "", ParseResponse, ParseResponseDummy));
		} else if (mode == 9){
			//Do nothing "connected test"
		} else if (mode == 10){
			StartCoroutine(pubnub.Subscribe(channel2, false, "", ParseResponse, ParseResponseDummy));
		}
			
		var count = 0;
	
		while(!deliveryStatus){
			yield WaitForSeconds(5);
			Debug.Log("waiting:" + count);
			count++;
		}
		Debug.Log("resp:"+response[0].ToString());
		var found = false;
		
		var output:Object[] = JsonReader.Deserialize (response[0].ToString()) as Object[];
		if(output != null){
			var k = 0;
			for (k = 0; k < output.Length; k++){
				var dict:Dictionary.<String, Object> = output[k] as Dictionary.<String, Object>;
				if(mode == 0){				
					Debug.Log("username:" + dict["username"].ToString());
					Debug.Log("message:" + dict["message"].ToString());
					if(dict["username"].ToString().Equals(messageToSend["username"]) && (dict["message"].ToString().Equals(messageToSend["message"]))){
						found = true;
					}
				} else if (mode == 1){	
					var c1:CustomClass = new CustomClass();
		//TODO: Check other values
					if(dict["foo"].Equals(c1.foo)){
						found = true;
					}
				} else if (mode == 2){
					var d1:PubnubDemoObject = new PubnubDemoObject();
		//TODO: Check other values			
					if(dict["OperationName"].Equals(d1.OperationName)){
						found = true;
					}
				} else if (mode == 3){
					Debug.Log("output[k]:" + output[k].ToString());
					if(output[k].Equals("/")){
						found = true;
					}
				} else if (mode == 4){
					Debug.Log("output[k]:" + output[k].ToString());
					if(output[k].Equals("\"'")){
						found = true;
					}
				} else if (mode == 6){				
					Debug.Log("output[k]:" + output[k].ToString());
					if(output[k].Equals("Text with 😜 emoji 🎉.")){
						found = true;
					}
				} else if (mode == 7){
					Debug.Log("output[k]:" + output[k].ToString());
					if(output[k].Equals("Text with ÜÖ漢語")){
						found = true;
					}
				} else if (mode == 8){
					Debug.Log("output[k]:" + output[k].ToString());
					if(output[k].Equals("Already Subscribed")){
						found = true;
					}
				} else if (mode == 9){
					Debug.Log("output[k]:" + output[k].ToString());
					if(output[k].Equals("Connected")){
						found = true;
					}
				}					
			}		
		}
		
		StartCoroutine(pubnub.Unsubscribe(channel, false, ParseResponseDummy));
		if(found){
			//IntegrationTest.Pass(gameObject);
			Debug.Log("throwing exception found");	
			throw new System.ArgumentException("UUIDFound", "UUIDFound");
		}
	}

	// boolean variable to decide whether to show the window or not.
	// Change this from the in-game GUI, scripting, the inspector or anywhere else to
	// decide whether the window is visible
	var doWindow0 : boolean = true;
 
	// Make the contents of the window.
	function DoWindow0 (windowID : int) {
 
	}

	public function ParseResponseConnected( msgs: Array ){
		Debug.Log("ParseResponse:" + msgs[0].ToString());	
		response = msgs;
		deliveryStatus = true;
	}

	public function ParseResponse( msgs: Array ){
		Debug.Log("ParseResponse:" + msgs[0].ToString());	
		var output:Object[] = JsonReader.Deserialize (msgs[0].ToString()) as Object[];
		if((output != null) && (output.Length > 1)){			
			if((output[0].ToString() == "1") && (output[1].ToString() == "Connected")){
				Debug.Log("Connected");
				return;
			}
		}
		response = msgs;
		deliveryStatus = true;
	}

	public function ParseResponseDummy( msgs: Array ){
		Debug.Log("ParseResponseDummy:" + msgs[0].ToString());		
	}

	function OnGUI(){
	
	}

	function Subscribe(ch:String){
		yield StartCoroutine(pubnub.Subscribe(ch, true, "", ParseResponseDummy, ParseResponse));
		yield WaitForSeconds(2);
		yield StartCoroutine(pubnub.Subscribe(ch, false, "", ParseResponseDummy, ParseResponse));
		yield WaitForSeconds(2);
	
	}

	function Unsubscribe(ch:String){
		StartCoroutine(pubnub.Unsubscribe(ch, false, ParseResponseDummy));
		yield WaitForSeconds(2);
		StartCoroutine(pubnub.Unsubscribe(ch, true, ParseResponseDummy));
		yield WaitForSeconds(2);
	}
}