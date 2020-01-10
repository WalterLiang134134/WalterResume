var portfolio_nowId = -1;
var portfolio_ajaxData = "";

(function($) {
    'use strict';

    /** Init settings **/
    (function() {
        // Setup reveal and ajax loading
        window.scrollRevealEnabled = function() {
            var scrollReveal = sessionStorage.getItem('scroll-reveal');
            if (scrollReveal == null) {
                sessionStorage.setItem('scroll-reveal', '1');
            }
            return scrollReveal == null ? true : (scrollReveal == '1');
        };
        window.ajaxLoadingEnabled = function() {
            var ajaxLoading = sessionStorage.getItem('ajax-loading');
            if (ajaxLoading == null) {
                sessionStorage.setItem('ajax-loading', '1');
            }
            return ajaxLoading == null ? true : (ajaxLoading == '1');
        };
    })();

    /** Window load handler **/
    $(window).load(function() {
        // Hide preloader
        $('#preloader').velocity({ opacity: 0 }, { visibility: "hidden", duration: 500 });

        // Fix menu rendering
        if (scrollRevealEnabled()) {
            $('.menuitem:last').one('afterReveal', function() {
                $('#nav').addClass('ui-menu-color06');
            });
        } else {
            $('#nav').addClass('ui-menu-color06');
        }

        // Header Animations
        if (scrollRevealEnabled()) {
            scrollReveal(scrollRevealItems.header);
        }

        // Sections Animation
        if (scrollRevealEnabled()) {
            scrollReveal(scrollRevealItems.content);
        }

        // Footer Animations
        if (scrollRevealEnabled()) {
            scrollReveal(scrollRevealItems.footer);
        }

        /** Back to top **/
        (function() {
            var backTopVisible = false;
            var backTopEvent = false;
            var $backTop = $('#back-top');
            $backTop.on('click', function() {
                $backTop.velocity({ bottom: "-=20px", opacity: 0 }, { visibility: "hidden" });
                $("body").velocity("scroll", {
                    duration: 1000,
                    begin: function() { backTopEvent = true },
                    complete: function() {
                        backTopEvent = false;
                        backTopVisible = false
                    }
                });
                return false;
            });

            var scrollTrigger = 100, // px
                backToTop = function() {
                    var scrollTop = window.pageYOffset;
                    if (scrollTop > scrollTrigger && !backTopVisible) {
                        backTopVisible = true;
                        $backTop.velocity({ bottom: '+=20px', opacity: 1 }, { visibility: 'visible', duration: 600 });
                    } else if (scrollTop <= scrollTrigger && backTopVisible && !backTopEvent) {
                        backTopVisible = false;
                        $backTop.velocity({ bottom: "-=20px", opacity: 0 }, { visibility: "hidden", duration: 600 });
                    }
                };
            backToTop();
            $(window).on('scroll', backToTop);
        })();


        /** Owl Carousel **/
        (function() {
            if ($('[data-section="owl-carousel"]').length) {
                $('[data-section="owl-carousel"]').imagesLoaded(function() {
                    //資料讀取-來源 Google Sheets
                    $.ajax({
                        type: "GET",
                        url: "https://spreadsheets.google.com/feeds/list/1cMFAce46AYcpCl_7oX8KfuZaTsnHxK2A7V8DrX7NnUQ/od6/public/values?alt=json",
                        dataType: 'jsonp',
                        catch: false,
                        success: function(data) {
                            portfolio_ajaxData = data.feed.entry;
                        },
                        error: function(xhr, ajaxOptions, thrownError) {
                            console.log("\x1b[31m" + xhr.status);
                            console.log("\x1b[31m" + thrownError);
                        }
                    });
                });
            }
        })();

        /* Google Analytics */
        window.dataLayer = window.dataLayer || [];

        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());

        gtag('config', 'UA-148431545-1');
    });

    /** Document ready handler **/
    $(document).ready(function() {
        sectionsScripts();
    });

    /** sections **/
    function sectionsScripts() {

        /** Animated Counter **/
        (function() {
            if ($('[data-section="counter"]').length) {
                var animateCounter = function(elem) {
                    elem = elem || document.querySelectorAll('.count-container span');
                    $(elem).counterUp({
                        delay: 10, // the delay time in ms
                        time: 1000 // the speed time in ms
                    });
                };

                if (scrollRevealEnabled()) {
                    $('[data-section="counter"] .count').one('afterReveal', function() {
                        animateCounter($(this).find('span'));
                    });
                } else {
                    animateCounter();
                }
            }
        })();

        /** Progress Bars **/
        (function() {
            if ($('[data-progressbar]').length) {
                $('[data-progressbar]').each(function(key, bar) {
                    var data = progressbarConfig($(bar).data());
                    switch (data.progressbar) {
                        case 'line':
                            bar = new ProgressBar.Line(bar, data);
                            break;
                        case 'circle':
                            bar = new ProgressBar.Circle(bar, data);
                            break;
                        case 'semicircle':
                            bar = new ProgressBar.SemiCircle(bar, data);
                            break;
                    }

                    if (scrollRevealEnabled()) {
                        $('[data-section="progress"]').one('afterReveal', function() {
                            bar.animate(data.value);
                        });
                    } else {
                        bar.animate(data.value);
                    }
                });
            }
        })();

        /** Skill Charts **/
        (function() {
            if ($('[data-section="charts"]').length) {
                var chart = new Chartist.Pie('#SkillPie', {
                    series: [11, 8, 3, 3],
                    labels: ['資訊設計 44 %', '響應式網頁設計 32 %', '行銷企劃 12 %', 'APP設計 12 %']
                }, {
                    donut: true,
                    showLabel: true,
                    chartPadding: 0,
                    labelOffset: 0,
                });

                chart.on('draw', function(data) {
                    if (data.type === 'slice') {
                        var pathLength = data.element._node.getTotalLength();

                        data.element.attr({
                            'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
                        });

                        var animationDefinition = {
                            'stroke-dashoffset': {
                                id: 'anim' + data.index,
                                dur: 500,
                                from: -pathLength + 'px',
                                to: '0px',
                                easing: Chartist.Svg.Easing.easeOutQuint,
                                fill: 'freeze'
                            }
                        };

                        if (data.index !== 0) {
                            animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
                        }

                        data.element.attr({
                            'stroke-dashoffset': -pathLength + 'px'
                        });

                        data.element.animate(animationDefinition, false);
                    }
                });
            }
        })();

        /** Portfolio section **/
        (function() {
            if ($('[data-section="portfolio"]').length) {

                // Isotope Portfolio
                var grid = $('.grid').isotope({
                    itemSelector: '.grid-item',
                    percentPosition: true,
                    transitionDuration: '0.6s',
                    hiddenStyle: {
                        opacity: 0
                    },
                    visibleStyle: {
                        opacity: 1
                    },
                    masonry: {
                        columnWidth: '.grid-sizer'
                    }
                });

                grid.imagesLoaded(function() {
                    grid.isotope();
                });

                grid.isotope({ filter: '*' });

                // filter items on button click
                $('#isotope-filters').on('click', 'a', function() {
                    var filterValue = $(this).attr('data-filter');
                    grid.isotope({ filter: filterValue });
                    console.log(filterValue);
                });

                // filter items on tag click
                $('.post-tag').on('click', 'a', function() {
                    var filterValue = $(this).attr('data-filter');
                    grid.isotope({ filter: filterValue });
                    $('#isotope-filters a[data-filter="' + filterValue + '"]').focus();
                });
            }
            if ($('[data-section="gallery"]').length) {
                /* hobbies Photos */
                $('#PhotoPopup').magnificPopup({
                    items: [{
                        src: 'assets/images/PhotoGraghic/view1.jpg',
                        title: '屏東-神山瀑布'
                    }, {
                        src: 'assets/images/PhotoGraghic/view2.jpg',
                        title: '台東-金崙大橋'
                    }, {
                        src: 'assets/images/PhotoGraghic/view3.jpg',
                        title: '台東-魯拉克斯吊橋'
                    }, {
                        src: 'assets/images/PhotoGraghic/view4.jpg',
                        title: '南投-日月潭'
                    }, {
                        src: 'assets/images/PhotoGraghic/view5.jpg',
                        title: '台中-花卉博覽會'
                    }, {
                        src: 'assets/images/PhotoGraghic/view6.jpg',
                        title: '台中-咖波屋'
                    }, {
                        src: 'assets/images/PhotoGraghic/view7.jpg',
                        title: '花蓮-新城天主教堂-神父'
                    }, {
                        src: 'assets/images/PhotoGraghic/view8.jpg',
                        title: '花蓮-新城天主教堂'
                    }, {
                        src: 'assets/images/PhotoGraghic/view9.jpg',
                        title: '花蓮-石梯坪海岸'
                    }, {
                        src: 'assets/images/PhotoGraghic/view10.jpg',
                        title: '墾丁-龍磐公園'
                    }, {
                        src: 'assets/images/PhotoGraghic/view11.jpg',
                        title: '綠島-白色恐怖綠島紀念園區'
                    }, {
                        src: 'assets/images/PhotoGraghic/view12.jpg',
                        title: '宜蘭-五峰旗瀑布'
                    }, {
                        src: 'assets/images/PhotoGraghic/view13.jpg',
                        title: '日本-日枝神社'
                    }, {
                        src: 'assets/images/PhotoGraghic/view14.jpg',
                        title: '日本-台場海岸'
                    }, {
                        src: 'assets/images/PhotoGraghic/view15.jpg',
                        title: '日本-荒川線'
                    }, {
                        src: 'assets/images/PhotoGraghic/view16.jpg',
                        title: '花蓮-新城天主教堂-貓'
                    }, {
                        src: 'assets/images/PhotoGraghic/view17.jpg',
                        title: '日本-宮城藏王狐狸村-狐狸'
                    }, {
                        src: 'assets/images/PhotoGraghic/view18.jpg',
                        title: '日本-宮城藏王狐狸村-狐狸'
                    }],
                    gallery: {
                        enabled: true
                    },
                    type: 'image'
                });
            }
        })();
    }

    /** Load js script to head **/
    function loadScript(src, id) {
        if (document.getElementById(id)) {
            return;
        }
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.id = id;
        document.getElementsByTagName("head")[0].appendChild(script);
        script.src = src;
    }

    /** Handler Animation **/
    function scrollReveal(items) {

        window.sr = window.sr || ScrollReveal();

        $.each(items, function(itemKey, reveal) {
            $(reveal.selector).each(function(index, elem) {
                var data = elem.dataset;

                var revealData = {
                    duration: (typeof data.animationDuration != "undefined") ? parseInt(data.animationDuration) :
                        (reveal.data.duration || 1000),
                    origin: (typeof data.animationOrigin != "undefined") ? data.animationOrigin :
                        (reveal.data.origin || 'bottom'),
                    distance: (typeof data.animationDistance != "undefined") ? data.animationDistance :
                        (reveal.data.distance || '0px'),
                    delay: (typeof data.animationDelay != "undefined") ? parseInt(data.animationDelay) :
                        (reveal.data.delay || 0),
                    scale: (typeof data.animationScale != "undefined") ? parseFloat(data.animationScale) :
                        (reveal.data.scale || 1),
                    rotate: (typeof data.animationRotate != "undefined") ? data.animationRotate :
                        (reveal.data.rotate || { x: 0, y: 0, z: 0 }),
                    easing: (typeof data.animationEasing != "undefined") ? data.animationEasing :
                        (reveal.data.easing || 'cubic-bezier(1.000, 1.000, 1.000, 1.000)'),
                    mobile: false,
                    afterReveal: function(elem) { $(elem).trigger('afterReveal') }
                };

                window.sr.reveal(elem, revealData);

                if (window.sr.tools.isMobile()) {
                    $(elem).trigger('afterReveal');
                }
            });
        });
    }

    /** progress bar Config **/
    function progressbarConfig(data) {
        return {
            value: (typeof data.progressbarValue != "undefined") ? parseFloat(data.progressbarValue) : 1,
            progressbar: (typeof data.progressbar != "undefined") ? data.progressbar : 'circle',
            color: (typeof data.progressbarColor != "undefined") ? data.progressbarColor : '#fff',
            strokeWidth: (typeof data.progressbarStrokewidth != "undefined") ? parseInt(data.progressbarStrokewidth) : 4,
            trailWidth: (typeof data.progressbarTrailwidth != "undefined") ? parseFloat(data.progressbarTrailwidth) : 1,
            trailColor: (typeof data.progressbarTrailcolor != "undefined") ? data.progressbarTrailcolor : '#f4f4f4',
            easing: (typeof data.progressbarEasing != "undefined") ? data.progressbarEasing : 'easeInOut',
            duration: (typeof data.progressbarDuration != "undefined") ? parseInt(data.progressbarDuration) : 1400,
            text: {
                style: {
                    color: '#fff',
                    position: 'absolute',
                    right: '0',
                    top: '-33px',
                    padding: 0,
                    margin: 0,
                    transform: null
                },
                autoStyleContainer: false
            },
            from: (typeof data.progressbarFrom != "undefined") ? data.progressbarFrom : { color: '#aaa', width: 1 },
            to: (typeof data.progressbarTo != "undefined") ? data.progressbarTo : { color: '#333', width: 4 },
            // Set default step function for all animate calls
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);

                var value = Math.round(circle.value() * 100);
                if (value === 0) {
                    circle.setText('');
                } else {
                    circle.setText(value + '分');
                }
            }
        };
    }
})(jQuery);


/* Portfolio Detail Click */
function portfoiloDetail(msg) {
    var clickID = msg;
    var hrefHash = location.hash;

    var ImgArray = new Array();
    var result = "";
    var dTitle = portfolio_ajaxData[clickID]['gsx$title']['$t'];
    var dContent = portfolio_ajaxData[clickID]['gsx$content']['$t'];
    var dImg = portfolio_ajaxData[clickID]['gsx$img']['$t'];

    var prevID = "";
    var nextID = "";
    var prevBtn = "";
    var nextBtn = "";
    var categoryArray = "";
    var BtnElementS = '<a onclick="portfoiloDetail(';
    var BtnElementPrevE = ')" class="btn btn-blue btn-sm">上一個</a>'
    var BtnElementNextE = ')" class="btn btn-blue btn-sm">下一個</a>';
    var CloseBtn = '<a class="btn btn-darker btn-sm" data-dismiss="modal">關 閉</a>';

    console.log("\x1b[33m初始資料" + "\n" + "Click:" + clickID + "\n" + "portfolio_nowId:" + portfolio_nowId + "\n" + "hrefHash:" + hrefHash);

    /* indexOf 迴圈抓取與 isotope-filters 相符字串
     * 判斷 Category 不等於 -1 填入 Array 陣列中
     */
    for (var i = 0; i < portfolio_ajaxData.length; i++) {
        searchCategory = portfolio_ajaxData[i]['gsx$category']['$t'].indexOf(hrefHash);
        if (searchCategory != -1) {
            categoryArray += i + ',';
        }
    }

    //刪除最後一個逗號，並正則表示
    categoryArray = categoryArray.slice(0, -1).split(',');

    /* 判斷-點擊項目是否以渲染資料
     * 否-重新渲染新資料
     * 是-直接開啟
     */
    if (clickID != portfolio_nowId) {
        console.log("更新資料");

        //渲染標題
        $('#detailTitle').html(dTitle);
        //渲染內容
        $('#detailContent').html(dContent);

        //切割字串
        ImgArray = dImg.split(",");

        //Owl 照片加入
        for (var i = 0; i < ImgArray.length; i++) {
            result += '<div class="item">' +
                '<img src="' + ImgArray[i] + '" class="img-responsive" alt="' + dTitle + '-' + i + '">' +
                '</div>'
        };

        // Owl 刪除
        $("#detailImg").remove();

        // 照片 Owl 渲染
        $('#owl-carousel').append('<div class="owl-carousel owl-theme" id="detailImg">' + result + '</div>');

        $('#owlloading').show();

        setTimeout(function() {
            $('#owlloading').hide();
            $("#detailImg").owlCarousel({
                items: 1,
                loop: true,
                nav: true,
                navText: [
                    "<i class='flaticon-arrowhead-thin-outline-to-the-left' aria-hidden='true'></i>",
                    "<i class='flaticon-arrow-point-to-right' aria-hidden='true'></i>"
                ],
                dots: true,
                margin: 0,
                autoplay: true,
                autoplayTimeout: 11000,
                autoplayHoverPause: true,
                autoplaySpeed: 1250,
                autoHeight: true
            });
        }, 2000);

        //更新ID
        portfolio_nowId = portfolio_ajaxData[clickID]['gsx$id']['$t'];

        //modal back to top
        $("#Detail-Modal").scrollTop(0);

        console.log("\x1b[34m" + "目前渲染資料ID：" + portfolio_nowId)
    } else {
        console.log("不更新資料");
    }

    switch (hrefHash) {
        case "#Info":
            console.log("Tabs:Info");
            PNcondition();
            break;
        case "#RWD":
            console.log("Tabs:RWD");
            PNcondition();
            break;
        case "#MarCom":
            console.log("Tabs:MarCom");
            PNcondition();
            break;
        case "#App":
            console.log("Tabs:App");
            PNcondition();
            break;
        default:
            console.log("Tabs:All");

            prevID = clickID + 1;
            nextID = clickID - 1;

            if (clickID == 0) {
                noNext()
            } else if (clickID == 18) {
                noPrev()
            } else {
                bothNP()
            }
            break;
    }

    //載入按鈕元件
    $("#fbtn").html(prevBtn + nextBtn + CloseBtn);
    console.log("\x1b[33m按鈕資料" + "\n" + prevBtn + "\n" + nextBtn);

    function PNcondition() {
        //判斷 portfoiloDetail Btn prev 的值，比 clickID 小就有下一頁。
        var next = categoryArray.filter(function(value) {
            return value < clickID
        });
        //pop() 抓取陣列中最後一個值
        nextID = next.pop();
        console.log('\x1b[36m比 clickID < 的第一個數值:' + nextID);

        //判斷 portfoiloDetail Btn next 的值，比 clickID 大就有上一頁。
        var prev = categoryArray.filter(function(value) {
            return value > clickID
        });

        //Shift() 抓取陣列中第一個值
        prevID = prev.shift();
        console.log('\x1b[36m比 clickID > 的第一個數值:' + prevID);

        if (nextID == undefined) {
            noNext();
        } else if (prevID == undefined) {
            noPrev();
        } else {
            bothNP();
        }
    }

    //已到最上一頁
    function noNext() {
        prevBtn = BtnElementS + prevID + BtnElementPrevE;
        nextBtn = "";
    }

    //已到最下一頁
    function noPrev() {
        prevBtn = "";
        nextBtn = BtnElementS + nextID + BtnElementNextE;
    }


    //上下一頁都有
    function bothNP() {
        prevBtn = BtnElementS + prevID + BtnElementPrevE;
        nextBtn = BtnElementS + nextID + BtnElementNextE;
    }
}