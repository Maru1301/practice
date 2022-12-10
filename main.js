$(function () {

    let list = [];
    let videoString1 = "https://www.youtube.com/embed/";
    let videoString2 = '?autoplay=1&enablejsapi=1'; // to control autoplay here
    // let playerDiv = document.querySelector('#playerDiv');
    let iframe = document.querySelector('#player');
    iframe.setAttribute('width', '600px');
    iframe.setAttribute('height', '400px');
    let btnChange = document.querySelector('#change');
    btnChange.addEventListener('click', changeSong)
    let divList = document.querySelector('#list');

    $('#search').on('click', function () {
        let listURL = $('#listURL').val();
        let urlIndex = listURL.indexOf('list=') + 5;
        let Id = listURL.slice(urlIndex);
        list = [];
        getData(Id);
        $('#listURL').val('')
    })

    getData('PLMxNn7qcGI1EDyXTzEOGNRGplQq0TXCs7');

    function changeSong() {
        let randURL = getRandom(list);
        iframe.setAttribute('src', randURL);
        onYouTubeIframeAPIReady();
    }

    function displayList() {
        divList.innerHTML = '';
        let orderList = document.createElement('ul');
        for (let i = 0; i < list.length; i++) {
            let innerList = document.createElement('li');
            innerList.setAttribute('class', 'song');
            let title = list[i].title;
            if (title.length > 30) {
                title = title.slice(0, 30) + '...';
            }
            innerList.innerHTML = title;
            let weightedList = document.createElement('ul');
            weightedList.setAttribute('class', 'weightedList');
            let weightedScore = `<li class="weighted"></li>`;
            let weightedActive = '<li class="weighted active"></li>';
            for (let i = 0; i < 5; i++) {
                if (i == 0) {
                    weightedList.innerHTML += weightedActive;
                } else {
                    weightedList.innerHTML += weightedScore;
                }
            }
            innerList.appendChild(weightedList);
            orderList.appendChild(innerList);
        }
        divList.appendChild(orderList);

        $('.song').on('click', function () {
            let song = getSong($(this)[0]);
            iframe.setAttribute('src', song.url);
        })

        $('.weighted').on('mouseenter', function () {
            let weightedList = $(this).parent();
            let activeIndex = weightedList.children('.active').length - 1;
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
            let song = getSong($(this).closest('.song')[0]);
            let ary = getAry($(this));
            let index = ary.indexOf($(this)[0]);
            song.weighted = index + 1;

            for (let i = 0; i < ary.length; i++) {
                if (i <= index)
                    $(this).parent().children(`.weighted:eq(${i})`).addClass('active')
                else {
                    $(this).parent().children(`.weighted:eq(${i})`).removeClass('active')
                }
            }
            $(this).parent().children().off('mouseleave');
            event.stopPropagation();
        })
    }

    function getSong(data) {
        let title = data.innerText.slice(0, 20);
        return list.find(item => item.title.startsWith(title));
    }

    function getAry(dom) {
        let weighteds = dom.parent().children();

        let ary = []
        for (let weighted of weighteds) {
            ary.push(weighted)
        }
        return ary;
    }

    function getData(listId = '') {
        axios.get('https://www.googleapis.com/youtube/v3/playlistItems',
            {
                params: {
                    part: 'snippet,contentDetails',// 必填，把需要的資訊列出來
                    playlistId: listId,// 播放清單的id
                    maxResults: 50,// 預設為五筆資料，可以設定1~50
                    key: 'AIzaSyDgaSxdat1-2TS2bbcbQfFRAvTADsLl7IQ'
                }
            }).then(res => {
                getAll(res.data.items);
            }).catch(e => console.log(e))
    }

    function getAll(datas) {
        let w = 1;
        for (let data of datas) {
            let item = {};
            item.url = videoString1 + data.snippet.resourceId.videoId + videoString2;
            item.title = data.snippet.title;
            item.weighted = w;
            list.push(item);
        }

        changeSong();
        displayList();
    }

    function getRandom(list) {
        let url;
        let weightedAry = [];
        let currentWeight = 0;
        for (let i = 0; i < list.length; i++) {
            currentWeight += list[i].weighted;
            weightedAry.push(currentWeight);
        }

        let rand = Math.floor(Math.random() * currentWeight);
        for (let i = 0; i < list.length; i++) {
            if (rand <= weightedAry[i]) {
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
