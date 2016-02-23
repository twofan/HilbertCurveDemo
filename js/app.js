/**
 * Created by Chen Yifan on 2/22/2016.
 */
angular.module('App', [])
    .controller('Controller', ['draw', function(draw) {
        var controller = this;
        controller.level = 5;
        controller.nodeNumber = 100;
        controller.groupNumber = 4;
        controller.draw = function(){
            var level = parseInt(controller.level);
            var nodeNumber = parseInt(controller.nodeNumber);
            var groupNumber = parseInt(controller.groupNumber);
            if (level<1 || level>7){
                level = 5;
                controller.level = 5;
            }
            if (nodeNumber<1 || nodeNumber>200){
                nodeNumber = 10;
                controller.nodeNumber = 10;
            }
            if (groupNumber<1 || groupNumber>10){
                groupNumber = 5;
                controller.groupNumber = 5;
            }
            var nodes = [];
            for (var i=0; i<nodeNumber; i++){
                var scale = 1 << level;
                var x = Math.floor(Math.random()*scale);
                var y = Math.floor(Math.random()*scale);
                nodes.push([x, y]);
            }
            draw(level, nodes, groupNumber);


        }
    }]).factory('draw', ['hilbert', function(hilbert){
    return function(level, nodes, groupNumber){
        var colors = ['#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#0000FF','#FF8000','#0080FF','#80FF00','#8000FF'];
        var canvas = document.getElementById("canvas");
        canvas.innerText= "";
        var height = 600;
        var width = 600;
        var pointSize = 5;
        var hilbertNodesCount = 1 << level * 2;
        var scale = 1 << level;
        var two = new Two({width:width, height:height}).appendTo(canvas);

        for (var i=0; i<nodes.length; i++){
            nodes[i].push(hilbert.xy2d(nodes[i][0], nodes[i][1],level));
        }
        nodes.sort(function(a,b){
            return a[2]-b[2];
        });
        var groupSize = nodes.length/groupNumber;
        console.log(groupSize);
        for (var i=0; i<nodes.length; i++){
            var point = two.makeCircle(nodes[i][0]*width/scale, nodes[i][1]*height/scale, pointSize);
            point.fill = colors[parseInt(i/groupSize)];
        }

        var previousNode = null;
        for (var i=0; i<hilbertNodesCount; i++){
            var node = hilbert.d2xy(level, i);
            node[0]/=scale;
            node[1]/=scale;

            if (i>0){
                var line = two.makeLine(previousNode[0]*width, previousNode[1]*height, node[0]*width, node[1]*height)
                line.linewidth = 1;
                line.stroke = 'orangered';
            }
            previousNode = node;
        }
        two.update();
    };
}]).factory('hilbert', function(){
    var pairs = [
        [[0, 3], [1, 0], [3, 1], [2, 0]],
        [[2, 1], [1, 1], [3, 0], [0, 2]],
        [[2, 2], [3, 3], [1, 2], [0, 1]],
        [[0, 0], [3, 2], [1, 3], [2, 3]]
    ];
    // d2xy and rot are from:
    // http://en.wikipedia.org/wiki/Hilbert_curve#Applications_and_mapping_algorithms
    function rot(n, x, y, rx, ry) {
        if (ry === 0) {
            if (rx === 1) {
                x = n - 1 - x;
                y = n - 1 - y;
            }
            return [y, x];
        }
        return [x, y];
    }
    return {
        xy2d: function(x, y, z) {
            var quad = 0,
                pair,
                i = 0;
            while (--z >= 0) {
                pair = pairs[quad][(x & (1 << z) ? 2 : 0) | (y & (1 << z) ? 1 : 0)];
                i = (i << 2) | pair[0];
                quad = pair[1];
            }
            return i;
        },
        d2xy: function(z, t) {
            var n = 1 << z,
                x = 0,
                y = 0;
            for (var s = 1; s < n; s *= 2) {
                var rx = 1 & (t / 2),
                    ry = 1 & (t ^ rx);
                var xy = rot(s, x, y, rx, ry);
                x = xy[0] + s * rx;
                y = xy[1] + s * ry;
                t /= 4;
            }
            return [x, y];
        }
    };
});