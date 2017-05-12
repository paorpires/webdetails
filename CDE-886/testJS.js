define(['cdf/lib/jquery', 'amd!cdf/lib/underscore', 'cdf/lib/CCC/protovis',  'cdf/Dashboard.Clean',  'cdf/lib/CCC/pvc', 'cdf/lib/CCC/def', 'cdf/dashboard/Utils', 'cdf/lib/moment',  'amd!cdf/lib/jquery.select2'],
        function($, _, pv, Dashboard, pvc, def, Utils, moment ) {
    
    
    var testJS = {};
    
    testJS.formatNumber = function(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
    
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        x2 = x2.slice(0, 3);
        return x1 + x2;
    };
    
    testJS.engNotation = function(d) { 
        var Log1000 = Math.log(1000);
        var engLabels = ['', ' k' , ' M', ' G' , ' T', ' P'];
        if ( d < 1 ) return Math.round(d*100)/100;
        var exponent3 = ( d === 0 ? 0 :
            Math.floor(Math.round( 100 * Math.log(d)/Log1000 )/100) );
        var mantissa = Math.round( 100* d / Math.pow(1000, exponent3))/100;
        return mantissa + engLabels[exponent3];
    };
    
    testJS.configurations = {
        
        charts:{
            
            exampleChart:{
                // general
                animate:                        true,
                height:                         400,
                width:                          900,
                ignoreNulls:                    false,
                plotFrameVisible:               false,
                legend:                         false,
                colors:                         ['#1F78B4', '#2BA02D'],
                orientation:                    'horizontal',
                
                // base axis
                baseAxisGrid:                   false,
                baseAxisTicks:                  false,
                baseAxisRule_strokeStyle:       "#B0B0B0",
                axisLabel_font:                 'normal 12px "Arial"',
                baseAxisTickFormatter:         function(val){
                    return moment(val).format("DD MMM, YYYY");
                },
                
                // ortho axis
                orthoAxisGrid:                  true,
                orthoAxisTicks:                 false,
                orthoAxisRule_visible:          false,
                orthoAxisGrid_strokeStyle:      "#E9E9E9",
                orthoAxisDesiredTickCount:      4,
                orthoAxisTickFormatter:         function(val){
                    return testJS.engNotation(val);
                }
            },
            
		}
    };
    
    
    return testJS;
});