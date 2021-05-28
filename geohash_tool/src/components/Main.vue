<template>
    <div class="map_container">
        <div class="ui_container">
            <el-row>
                <el-col :span="10">
                    <div class="option_input_label">geohash位数:</div>
                </el-col>
                <el-col :span="14">
                    <el-input v-model="geohash_precision" placeholder="geohash位数精度"></el-input>
                </el-col>
            </el-row>
            <el-row style="margin-top: 20px;">
                <el-col :span="24">
                    <div>点击地图时标记选项：</div>
                </el-col>
            </el-row>
            <el-row style="margin-top: 5px;">
                <el-col :span="12">
                    <el-radio v-model="labelType" label="1" class="option_radio_style">标注点击区域</el-radio>
                </el-col>
                <el-col :span="12">
                    <el-radio v-model="labelType" label="2" class="option_radio_style">标注相邻9区域</el-radio>
                </el-col>
            </el-row>
            <el-row style="margin-top: 20px;">
                <el-col :span="24">
                    <div>点击地图时添加删除选项：</div>
                </el-col>
            </el-row>
            <el-row style="margin-top: 5px;">
                <el-col :span="12">
                    <el-radio v-model="addRemoveType" label="1" class="option_radio_style">点击时添加</el-radio>
                </el-col>
                <el-col :span="12">
                    <el-radio v-model="addRemoveType" label="2" class="option_radio_style">点击时删除</el-radio>
                </el-col>
            </el-row>
            <el-row style="margin-top: 20px;">
                <el-col :span="24">
                    <el-button @click="clearMarker()">清除标注块</el-button>
                </el-col>
            </el-row>
        </div>
        <div class="covid_container">
            <el-button @click="showConv19()">显示新冠信息</el-button>
            <!--<el-table :data="convData"  max-height="500">
                <el-table-column property="type" label="类型"></el-table-column>
                <el-table-column property="info" label="信息" ></el-table-column>
            </el-table>-->
        </div>
        <div id="mapDiv" class="mapStyle"></div>
    </div>
</template>

<script>
import AMap from 'AMap';
import Geohash from 'latlon-geohash';

export default {
    data() {
        return {
            map: undefined,
            geohash_precision: 6,
            // rects: [],
            // labels: [],
            // labelCodes: [],
            markers: {},
            // 1：仅标注当前块。2：标注当前已经周边共计9块
            labelType: '1',
            // 1:添加 2：删除
            addRemoveType: '1',
            convDataGeneral:[],
            convDataDetail:[],
            GDPSpeed : {
                '520000':10,//贵州
                '540000':10,//西藏
                '530000':8.5,//云南 
                '500000':8.5,//重庆
                '360000':8.5,//江西
                '340000':8.0,//安徽
                '510000':7.5,//四川
                '350000':8.5,//福建
                '430000':8.0,//湖南
                '420000':7.5, //湖北
                '410000':7.5,//河南
                '330000':7.0,//浙江
                '640000':7.5,//宁夏
                '650000':7.0,//新疆
                '440000':7.0,//广东
                '370000':7.0,//山东
                '450000':7.3,//广西
                '630000':7.0,//青海
                '320000':7.0,//江苏
                '140000':6.5,//山西
                '460000':7,// 海南
                '310000':6.5,//上海
                '110000':6.5, // 北京
                '130000':6.5, // 河北
                '230000':6, // 黑龙江
                '220000':6,// 吉林
                '210000':6.5, //辽宁
                '150000':6.5,//内蒙古
                '120000':5,// 天津
                '620000':6,// 甘肃
                '610000':8.5,// 甘肃
                '710000':2.64, //台湾
                '810000':3.0, //香港
                '820000':4.7 //澳门
            }
        }
    },
    mounted() {
        this.initMap();
        // this.updateCov19();
    },
    methods: {
        initMap() {
            // district 行政区域 地图
            let disCountry = new AMap.DistrictLayer.Country({
                zIndex:10,
                SOC:'CHN',
                depth:1,
                styles:{
                    'nation-stroke':'#ff0000',
                    'coastline-stroke':'#0088ff',
                    'province-stroke':'#888888'
                },
                'fill':function(props){
                    return this.getColorByDGP(props.adcode_pro)
                    }
            })
            this.map = new AMap.Map('mapDiv', {
                center                              : [114.298572, 30.584355], //中心点 深圳
                // center                              : [116.397428, 39.90923], //中心点 北京
                zoom                                : 15, //地图层级
                rotateEnable                        : false, // 不可旋转
                dragEnable                          : true, // 不可拖拽。和报告的翻页冲突
                layers:[
                    disCountry
                ],
            });

            AMap.plugin('AMap.Geolocation', function() {
                console.log('before new AMap.Geolocation' );
                let geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：5s
                    buttonPosition:'RB',    //定位按钮的停靠位置
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点

                });

                this.map.addControl(geolocation);
                
                geolocation.getCurrentPosition(function(status,result){
                    if(status=='complete'){
                        // this.onComplete(result)
                        console.log('定位结果：' + result.position);
                    }else{
                        console.log('定位结果：' + result.position);
                    }
                });
            });

            this.map.on('complete', () => {
                console.log('map has loaded');
                // this.getExcelData('excel_data3.xlsx');
            });
            this.map.on('click', this.mapClick);
        },
        mapClick(e) {
            // this.clearGeohashRect();
            // this.clearLabel();
            let lon = e.lnglat.lng;
            let lat = e.lnglat.lat;
            console.log('map click. lng:', lon, ', lat:', lat);
            // let geohashCode = Geohash.encode(lon, lat, 9);
            let precision = this.geohash_precision;
            if (typeof(precision) == 'string') {
                precision = parseInt(precision);
            }
            let geohashCode = Geohash.encode(lat, lon, precision);
            console.log(geohashCode);
            if (this.addRemoveType == '1') {
                this.markerGeohash(geohashCode);
                if (this.labelType == '2') {
                    let neighboursCode = Geohash.neighbours(geohashCode);
                    console.log('neighboursCode:', neighboursCode);
                    for (let key in neighboursCode) {
                        this.markerGeohash(neighboursCode[key]);
                    }
                }
            }
            else {
                // this.removeMarker(geohashCode);
            }
        },
        rectClick(e) {
            // console.log('Rectangle click:', e);
            let geohashCode = e.target.getExtData();
            console.log('rectClick:', geohashCode);

            if (this.addRemoveType == '2') {
                this.removeMarker(geohashCode);
            }
        },
        labelClick(e) {
            let geohashCode = e.target.getExtData();
            console.log('getExtData:', geohashCode);
            if (this.addRemoveType == '2') {
                this.removeMarker(geohashCode);
            }
        },
        markerGeohash(geohashCode) {
            if (this.markers.hasOwnProperty(geohashCode)) {
                return;
            }

            let bounds = Geohash.bounds(geohashCode);
            console.log('bounds:', bounds);
            let southWest = new AMap.LngLat(bounds.sw.lon, bounds.sw.lat, true);
            let northEast = new AMap.LngLat(bounds.ne.lon, bounds.ne.lat, true);
            let amapBound = new AMap.Bounds(southWest, northEast);
            let boundRect = new AMap.Rectangle({
                map: this.map,
                zIndex: 10,
                bounds: amapBound,
                strokeColor: '#00FFFF',
                strokeOpacity: 0.9,
                strokeWeight: 1,
                fillColor: '#FFFF00',
                fillOpacity: 0.5,
                strokeStyle: 'solid',
                bubble: true,
                extData: geohashCode
            });
            boundRect.on('click', this.rectClick);

            const lonlat = Geohash.decode(geohashCode);
            let position = new AMap.LngLat(lonlat.lon, lonlat.lat, true);
            let textLabel = new AMap.Text({
                map: this.map,
                text: geohashCode,
                position: position,
                anchor: 'center',
                zIndex: 5,
                extData: geohashCode
            });
            textLabel.on('click', this.labelClick);

            this.markers[geohashCode] = {
                rect: boundRect,
                label: textLabel
            };
        },
        removeMarker(geohashCode) {
            if (!this.markers.hasOwnProperty(geohashCode)) {
                return;
            }
            let item = this.markers[geohashCode];
            item.rect.setMap(null);
            item.label.setMap(null);
            delete this.markers[geohashCode];
        },
        clearMarker() {
            for (let key in this.markers) {
                let item = this.markers[key];
                item.rect.setMap(null);
                item.label.setMap(null);
            }
            this.markers = {};
        },
        getCov19All() {
            //load conv 19 general data
            this.$axios.get('https://lab.isaaclin.cn/nCoV/api/overall')
            .then(res => {
                let data = [];
                let resdict = res.data.results[0];
                console.log("conv data", resdict);
                // 遍历数据给新的变量
                    for (var key in resdict) {
                        let item = resdict[key];
                    　　console.log(item); //AA,BB,CC,DD
                        let obj = {}
                        obj.type = key
                        obj.info = resdict[key]
                        console.log(key, resdict[key])
                        data.push(obj)
                    }
                //     for (let i = 0; i < reslist.length; i++) {
                //     let obj = {}
                //     // obj.type = reslist[i]
                //     // obj.info = reslist[i].ggxh
                //     // obj.dw = reslist[i].dw
                //     // obj.price = reslist[i].price
                //     // obj.taxRate = reslist[i].taxRate
                //     // data[i] = obj
                //     console.log("reslist[i]", reslist[i]);
                // }
            // 给数据源赋值
            this.convData = data
            })
            .catch(err => {
               console.log(err)
            })
        },
        getConv19Detail() {
            this.$axios.get('https://lab.isaaclin.cn/nCoV/api/area')
            .then(res => {
                let data = [];
                let resdict = res.data.results[0];
                console.log("conv data", resdict);
                // 遍历数据给新的变量
                    for (var key in resdict) {
                        let item = resdict[key];
                    　　console.log(item); //AA,BB,CC,DD
                        let obj = {}
                        obj.type = key
                        obj.info = resdict[key]
                        console.log(key, resdict[key])
                        data.push(obj)
                    }
                //     for (let i = 0; i < reslist.length; i++) {
                //     let obj = {}
                //     // obj.type = reslist[i]
                //     // obj.info = reslist[i].ggxh
                //     // obj.dw = reslist[i].dw
                //     // obj.price = reslist[i].price
                //     // obj.taxRate = reslist[i].taxRate
                //     // data[i] = obj
                //     console.log("reslist[i]", reslist[i]);
                // }
            // 给数据源赋值
            this.convData = data
            })
            .catch(err => {
               console.log(err)
            })
        },
        getColorByDGP : function(adcode){
            if(!colors[adcode]){
                var gdp = this.GDPSpeed[adcode];
                if(!gdp){
                    colors[adcode] = 'rgb(227,227,227)'
                }else{   
                    var r = 3;
                    var g = 140;
                    var b = 230;
                    var a = gdp/10;
                    colors[adcode] = 'rgba('+ r +','+ g +','+b+','+a+')';
                }
            }
            console.log("adcode",adcode,colors[adcode])
            return colors[adcode]
        }
    }
}
</script>

<style>
.map_container {
    position: relative;
    width: 100%;
    height: 100%;
}
.ui_container {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 10px 15px 0 rgba(136, 141, 152, 0.16);
    padding: 4px 16px 4px 16px;
    width: 250px;
}
.mapStyle {
    position: relative;
    width: 100%;
    height: 100%;
}
.option_input_label {
    /* float: left; */
    text-align: left;
    line-height: 40px;
    margin: 0;
    color: #222;
    font-size: 15px;
    font-weight: 500;
}
.option_input_content {
    float: left;
    width: 60%;
}
.option_radio_container {
    position: relative;
    width: 100%;
    margin: 20px 0 20px 0;
}
.option_radio_style {
    /* float: left; */
    /* width: 35%; */
    position: relative;
}
.option_divider {
    position: relative;
}
.covid_container{
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    /*background-color: #fff;*/
    border-radius: 6px;
    box-shadow: 0 10px 15px 0 rgba(136, 141, 152, 0.16);
    padding: 4px 16px 4px 16px;
     /*width: 250px;*/
}
</style>