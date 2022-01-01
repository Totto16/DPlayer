// stats.js: JavaScript Performance Monitor
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function animate() {
    stats.begin();
    // monitored code goes here
    stats.end();

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

initPlayers();

function initPlayers() {

    const qualities =/*  [{
            "name": "1080p",
            "url": "https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp",
            "type": "normal"
        },
        {
            "name": "720p",
            "url": "https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp",
            "type": "normal"
        }
    ];
     */
    [  {
        "name": "FHD",
        "url": "http://localhost:9090/[Totto]DetektivConan-1029-RFCT-[1080p].mp4",
        "type": "normal"
      },{
          "name": "1080p",
          "url": "https://ddl.amalgam-fansubs.moe/content/Conan/1080p/%5BTotto%5DDetektivConan-1029-RFCT-%5B1080p%5D.mp4",
          "type": "normal"
        },
        {
          "name": "720p",
          "url": "https://ddl.amalgam-fansubs.moe/content/Conan/720p/%5BAMALGAM%5DConan_1029%5B1280x720%5D%5Bx264%5D%5BHD%5D.mp4",
          "type": "normal"
        },
        {
          "name": "cdn",
          "url": "https://cdn.amalgam-fansubs.moe/detektiv-conan/1029/master.m3u8",
          "type": "hls"
        },

      ];

    const dpOptions = {
        container: document.getElementById("video-wrapper"),
        screenshot: true,
        lang: "de",
        video: {
            quality: qualities,
            defaultQuality: 0,
            pic: 'http://localhost:9090/amalgam-1029.png',
           // thumbnails: 'API',
        },
        API_URL:'https://ddl.amalgam-fansubs.moe/DPlayer.php',
        theme:"red",
        hotkey: true,
        highlights:{vtt:"API",mode:"auto"}, //TODO make all reasonable things also able to request via API 
        //TODO autoNext (enable default +1 counter and function to manually pass how to behave or API)
        airplay: "vendor",
        fullScreenPolicy: 0, // available "OnlyNormal","OnlyWeb","Both" or 0,1,2
        highlightSkip:true,
        highlightSkipMode: 0 ,// available "smoothPrompt", "immediately", "smoothCancelPrompt", "always" or 0,1,2,3
        hardSkipHighlights:false,
        highlightSkipArray:['*',/.*Ending.*/i,/.*Opening.*/i,/.*Pause.*/i],
        chromecast: "vendor"
    };
    //const dp = new DPlayer(dpOptions);

    if(typeof DPlayer !== "undefined"){
        window.dp = new DPlayer(dpOptions);
    }else{
        window.DPLAYER_AUTO = {name:"dp",options:dpOptions}
    }

}