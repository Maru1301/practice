$(function () {

    let list = [];
    let videoString1 = "https://www.youtube.com/embed/";
    let videoString2 = '?autoplay=0&enablejsapi=1'; // to control autoplay here
    // let playerDiv = document.querySelector('#playerDiv');
    let iframe = document.querySelector('#player');
    iframe.setAttribute('width', '600px');
    iframe.setAttribute('height', '400px');
    let btnChange = document.querySelector('#change');
    btnChange.addEventListener('click', changeSong)
    let divList = document.querySelector('#list');

    getData();

    function changeSong() {
        let randURL = getRandom(list);
        iframe.setAttribute('src', randURL);
        onYouTubeIframeAPIReady();
    }

    function displayList() {
        let orderList = document.createElement('ul');
        for (let i = 0; i < list.length - 1; i++) {
            let innerList = document.createElement('li');
            innerList.setAttribute('class', 'songs');
            let title = list[i].title;
            if (title.length > 30) {
                title = title.slice(0, 30) + '...';
            }
            innerList.innerHTML = title;
            let weightedList = document.createElement('ul');
            weightedList.setAttribute('class', 'weightedList')
            let weightedScore = `<li class="weighted"></li>`;
            for (let i = 0; i < 5; i++) {
                weightedList.innerHTML += weightedScore;
            }
            innerList.appendChild(weightedList);
            orderList.appendChild(innerList);
        }
        divList.appendChild(orderList);

        $('.songs').on('click', function () {
            let title = $(this)[0].innerText.slice(0, 20);
            let song = list.find(item => item.title.startsWith(title));
            iframe.setAttribute('src', song.url);
        })

        $('.weighted').on('mouseenter', function () {
            let weightedList = $(this).parent();
            let activeIndex = weightedList.children('.active').length - 1;
            console.log(activeIndex);
            let ary = getAry($(this));
            let index = ary.indexOf($(this)[0]);

            for (let i = 0; i < ary.length; i++) {
                if (i > index) break;
                weightedList.children(`.weighted:eq(${i})`).addClass('active')
            }
            $(this).on('mouseleave', function () {
                let index = ary.indexOf($(this)[0]);

                for (let i = 0; i < ary.length; i++) {
                    if (i > index) break;
                    $(this).parent().children(`.weighted:eq(${i})`).removeClass('active');
                }

                for (let i = 0; i <= activeIndex; i++) {
                    $(this).parent().children(`.weighted:eq(${i})`).addClass('active');
                }
            })
        })

        $('.weighted').on('click', function () {
            let ary = getAry($(this));
            let index = ary.indexOf($(this)[0]);

            for (let i = 0; i < ary.length; i++) {
                if (i <= index)
                    $(this).parent().children(`.weighted:eq(${i})`).addClass('active')
                else {
                    $(this).parent().children(`.weighted:eq(${i})`).removeClass('active')
                }
            }
            $(this).parent().children().off('mouseleave');
        })
    }

    function getAry(dom) {
        let weighteds = dom.parent().children();

        let ary = []
        for (let weighted of weighteds) {
            ary.push(weighted)
        }
        return ary;
    }

    function getData() {
        axios.get('https://www.googleapis.com/youtube/v3/playlistItems',
            {
                params: {
                    part: 'snippet,contentDetails',// 必填，把需要的資訊列出來
                    playlistId: 'PLMxNn7qcGI1EDyXTzEOGNRGplQq0TXCs7',// 播放清單的id
                    maxResults: 50,// 預設為五筆資料，可以設定1~50
                    key: 'AIzaSyDgaSxdat1-2TS2bbcbQfFRAvTADsLl7IQ'
                }
            }).then(res => {
                getAll(res.data.items);
            }).catch(e => console.log(e))
    }

    function getAll(datas) {
        let w = 0;
        for (let data of datas) {
            w++;
            if (w % 2 == 0) {
                w++;
            }
            let item = {};
            item.url = videoString1 + data.snippet.resourceId.videoId + videoString2;
            item.title = data.snippet.title;
            item.weighted = w;
            list.push(item);
        }

        let item = {};
        item.w = w;
        list.push(item);

        var randomVideoUrl = getRandom(list);
        iframe.setAttribute('src', randomVideoUrl);
        displayList();
    }

    function getRandom(list) {
        let url;
        let rand = Math.floor(Math.random() * list[list.length - 1].w);
        for (let i = 0; i < list.length; i++) {
            if (rand <= list[i].weighted) {
                url = list[i].url;
                break;
            }
        }

        return url;
    }

    var player;
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady() {
        player.playVideo();
    }

    function onPlayerStateChange(event) {
        switch (event.data) {
            case 0:
                // record('video ended');
                changeSong();
                break;
            case 1:
                // record('video playing from ' + player.getCurrentTime());
                break;
            case 2:
            // record('video paused at ' + player.getCurrentTime());
        }
    }
    function record(str) {
        let record = document.querySelector('.record');
        var p = document.createElement("p");
        p.appendChild(document.createTextNode(str));
        record.appendChild(p);
    }

})
