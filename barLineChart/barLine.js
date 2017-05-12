define(['cdf/lib/jquery'], function($) {
    var barLineJS = {};

    barLineJS.configurations = {
        barLineSettings:{
            width:  600,
            height: 400,
        
            // Data source
            crosstabMode: false,
        
            //  map logical table columns -> dimensions
            readers: 'Product, Markets, Quantity, Sales',
        
            // Data
            dimensions: {
                Quantity:      {format: "#,0"  },
                Sales:          {format: "#,0.0"}
            },
        
            // Plots
            plots: [
                {
                    name: 'main',
                    visualRoles: {
                        value:    'Quantity',
                        series:   'Product',
                        category: 'Markets'
                    }
                },
                {
                    type: 'point',
                    linesVisible: true,
                    dotsVisible:  true,
                    orthoAxis: 2,
                    colorAxis: 2,
                    nullInterpolationMode: 'linear',
                    visualRoles: {
                        value: 'Sales',
                        color: {legend: {visible: false}}
                    }
                }
            ],
        
            // Cartesian axes
            axisGrid_strokeStyle: '#F7F8F9',
            axisLabel_font: 'normal 10px "Open Sans"',
            axisTitleLabel_font: 'normal 12px "Open Sans"',
        
            baseAxisTooltipAutoContent: 'summary',
            axisBandSizeRatio: 0.6,
        
            orthoAxisTitle:  "Count",
            orthoAxisOffset: 0.02,
            orthoAxisGrid:   true,
        
            ortho2AxisTitle: "Avg. Latency",
        
            // Color axes
            colors: [
                '#005CA7', '#FFC20F', '#333333'
            ],
            color2AxisTransform: function(c) { return c.brighter(0.5); },
        
            // Panels
            legend: true,
            legendFont: 'normal 11px "Open Sans"',
        
            // Chart/Interaction
            animate:    true,
            selectable: true,
            hoverable:  true,
            tooltipClassName: 'light',
            tooltipOpacity: 1
        }
    };
        
        return barLineJS;
        
});