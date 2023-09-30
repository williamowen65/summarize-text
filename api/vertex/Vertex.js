var Vertex = (function (ns = {})
{
  var API_NAME = 'Vertex'

  // Summarize text
  // See https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/text-bison?project=testing-project-400518
  // for a list of parameters
  // and https://cloud.google.com/vertex-ai/docs/samples/aiplatform-sdk-summarization#aiplatform_sdk_summarization-java
  // https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.publishers.models/predict
  // https://cloud.google.com/vertex-ai/docs/generative-ai/text/test-text-prompts?_ga=2.99645661.-2130652721.1671733336&_gac=1.220713194.1695856350.Cj0KCQjwpc-oBhCGARIsAH6ote-iw2iBwowK3TwtFhW9VN4n15qswiRo9iV5i-jBpU4WpadctTMl23waAhGBEALw_wcB
  ns.getSummary = function ()
  {

    const instance = {
      content: `List the names of the people involved in this conversation:
[0:00] For English. Press one button, please. Enter your PIN number.
[0:12]  Your current balance is $5.09. Please enter the area code, please wait. While your call is being processed. During this time, you will hear nothing until after call acceptance.
[1:14]  Hello. This is a prepaid debit call from Scott.
[0:52] A prisoner at the Michigan Department of Corrections Lakeland facility to accept this call, press zero to refuse this. Call hang up or press one. To prevent calls from this facility press six.
[1:27]  Hello. This is a prepaid debit call from Scott, this call is from a correction facility and is subject to monitoring and recording said, you're using PCS is inmate telephone services.
[1:26] Hello. Hey, what's up Paulie? How you doing?
[1:36]  I finally got some money put on the phone. Hey it ain't much but at least I'll be able to call you. I called your sister once and then I called you and said I want to get about three phone calls out of it. So how long? Huh?
[2:05]  I didn't hear you.
[2:11]  Yeah, she answered. I talked to her so she was yeah, today. She was just, I tried calling you first and then I called her it's probably was this morning. So she was just coming back from her WIC appointment or speak with the kids.
[2:03] Oh, and then your grandma showed up lost you. As while I was just at the end of the phone call, so but not talk to her for a minute, and I know it's been a minute since I've been, I'll talk to you guys, but this fucking they change a phone system here. Now, phone calls are twice. The amount of money is what they used to be. So it's kind of fucking ridiculous, but
[2:46]  Not, I don't know, not a whole lot we can do about it, I guess, unless they ever change it again, but who knows? So how you doing? Yeah, how's your court thing end up?
[2:37] I don't know. The last time I was talking to you, you're telling you had to go to court for a minor in possession or something.
[2:51]  Yeah.
[3:00]  Right, right. So then what
[3:17]  you never went to the class, right? Are you going to huh, right? What do you got to pay for the class?
[3:36]  Oh yeah, for the class, right? So what do you got to go back to court and show them that you did everything or something off? Right. Right. Well you take care of that shit man. Don't end up in fucking in this mess. Like I am. You know what I mean? You know, especially something like that. Keep putting it off and you keep Diggin. Oh, worse and worse, and worse. I've done it before myself. You know what I mean? It's best just to get it taken care of, get out of the way and put it behind me, you know, then you don't got them crawl on, on your bank, you know, probation department or whatever it might be, you know.
[3:47] But anyway, so what else has been going on with you?
[3:57]  Huh.
[4:04]  Say what?
[4:09]  Nothing. I can barely hear you. What are you driving or something?
[4:18]  Oh. Okay, right. We at home.
[4:27]  Oh, okay, right. So what what else you've been getting? Been up the shithouse.
[4:43]  no, do you get your car fixed yet or
[4:21] Oh, okay. Well I haven't been on a real, huh.
[4:34]  You read it together. How did you do that?
[4:44]  Right. Right. Well, you didn't put in your motor blown or something.
[4:59]  Say what?
[5:06]  Right. Okay.
[5:12]  So what so what else has been going on? You still staying at home with Mom or what?
[4:52] Yeah, so say what?
[5:04]  Oh yeah. So she hasn't been paying the mortgage or what
[5:17]  Just falling behind. Also bread bread isn't helping her. He just said fuck it.
[5:32]  Right. So what was she going to do, if that happens?
[5:48]  Say what?
[5:29] Right. What? What she staying with him or something?
[5:44]  Oh, okay. Right. Right. So what do you just pretty much staying at the house by yourself?
[6:04]  Which probably got it. Like a party house. Know what you say? What you don't.
[6:23]  Right. So right. So we'll have you met your mom's new boyfriend yet or what?
[6:06] Yeah, we'll see. Like
[6:12]  you don't like them.
[6:17]  Why not?
[6:24]  Say what?
[6:32]  She thinks she's the shit.
[6:39]  Oh, he thinks he is. Well, how old is he?
[6:48]  Yeah. Why you say you think she's a shit?
[6:39] Right? Oh yeah. So well, that sounds interesting. Huh. I haven't talked to your mom too long, long ass time, so I don't know. She told me she told me to write her a while while ago and she write me back and never did but kind of figured out what's coming.
[7:28]  But huh.
[7:05] Right, right? Well, it's pretty, you know, it's pretty good for, you know, I guess maybe in a know, it isn't.
[7:23]  Yeah. Yeah. I mean, who knows? You know, I don't think your mom. I don't think your mom's used to being alone though, either. You know what I mean? She kind of goes from one relationship to another, you know, I mean most, a lot of women are like that though. You know, you figured women, you know, they want somebody in their life, you know. So, you know, some, a lot of women are like it that way just need somebody there, you know, to support a little way or another, you know, just wait life. I guess, I don't know.
[7:45] So, who do you got going on today?
[7:54]  Yeah. Yeah, it's raining, like, mad here. It's been raining all day here. So,
[8:06]  Been watching a USB lately, right? Right. So what are you been up to?
[8:25]  Huh.
[8:30]  Yeah, that's it. So having a hard time hearing you.
[8:44]  Oh okay, right now I hear you better than all so. Well so nothing else new on the
[8:23] I'm going on.
[8:30]  Staying out of trouble.
[8:36]  Trying to. Yeah. You got any trouble since then?
[8:45]  No, well, that's good. That's a bonus.
[8:56]  You know what I mean? I date believe me. I know how it is. I've been there for many, many, many years, you know. So, even when you were a kid, you know what I mean?
[9:23]  You and your mom and I was, yeah, I still got in trouble, you know, she kept me, she kept me out of a lot more than I probably could have gotten into but I still got phone myself from a fair share of Fairfax trouble, you know.
[9:09] But so anyway, so what else been going on, schitt's about it.
[9:23]  Yeah. So
[9:28]  Well, you seen your sister lately at all? Or what? Okay, right. You see. You see? You're a lot.
[9:48]  Right. So how the kids doing our kids doing good? Yeah, she was told me they might huh?
[9:41] She did what?
[9:49]  Yeah, you got a stuck. How do you get it out?
[10:01]  Really. Oh man. He's probably
[10:15]  right. Yeah.
[10:20]  Really, huh? Well, that's good. So, yes, you said he's getting big. He's like twenty-five pounds and James like ten pounds and five ounces an hour or something.
[10:13] So, so you like going over there and playing whatever?
[10:30]  Huh.
[10:35]  Nice playing with you fight with them, don't you?
[10:48]  Rest of the wrong with them and stuff.
[10:56]  Yeah. Yeah. You know before and I wish I could do that, you know.
[11:12]  so,
[10:46] So, what else is happening? Shit? You got a girlfriend or you just making the rounds still?
[11:03]  Yeah.
[11:08]  Why not? Why is why is that?
[11:16]  Right. Just like doing your own thing. Right? Right. Well, that's good. I mean you got to do your own thing. You're young, man. You gotta, you know, live, you know, I'm ready for something like that.
[11:21] They all got girlfriends.
[11:31]  Right? They probably they probably girlfriend's, probably hated when you come around then huh, do they do? Yeah, because they think when they go out with you you guys are all hunting women, huh? Right? Holyshit may I just stood up. I got a headrest. Make a motherfuker felt like I was going to fall out but yeah, I know it's kind of, you know, your mom and I were married kind of same way cuz I was me and her we're kind of young, you know, but nobody else has married, you know. So when I go out with my friends and share, you my used to hate it, she hated every one of my friends, you know, but that's all cuz they were all single and didn't have girlfriends or weren't married, you know? So she figured if we were out, we were just out, you know, putting women down, which wasn't the case, you know.
[12:20] But I don't know, you know, that's women that's woman for you though, you know?
[12:31]  So anyways, we'll look I'm going to let you go before all this money runs out cuz I don't I'd like to be able to call you again, you know. So I don't want to use it all up at once. All right, so take care Thursday out of trouble. You know, I love you, I miss you. All right. Yeah, I'm trying my best, you know, but I love you. All right.
[13:16]  I'll talk to you later, okay.
[13:22]  All right, bye.
  Summary: 
  `,
    };

    const payload = {
      "instances": [instance],
      "parameters": {
        "temperature": 0.2,
        "maxOutputTokens": 256,
        "topK": 40,
        "topP": 0.95
      },
    };

    return fetch(
      'POST',
      `projects/testing-project-400518/locations/us-central1/publishers/google/models/text-bison@001:predict`,
      payload
    )

  }


  return ns;

  // -----------------
  // Private functions

  // -----------------
  // Private functions

  function fetch(method, endpoint, payload)
  {
    var root = 'https://us-central1-aiplatform.googleapis.com/v1/';
    console.log("Calling Google speech-to-text endpoint '%s' with method %s", root + endpoint, method)

    var params = {
      'method': method,
      'headers': {
        'Authorization': "Bearer " + ScriptApp.getOAuthToken(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    if (payload)
    {
      params.payload = JSON.stringify(payload)
      console.log("Payload is %s", JSON.stringify(payload))
    }
    if (DEBUG) params.muteHttpExceptions = true;

    var response = FetchTools.backoffOne(root + endpoint, params);
    var content = response.getContentText();
    // Some endpoints return empty response.
    if (!content)
    {
      console.log("API returned an empty response")
      return null;
    }
    console.log(content)
    var json = JSON.parse(content);
    return json;

  }



})()