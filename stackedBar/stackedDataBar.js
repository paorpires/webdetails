require(['cdf/AddIn',
        'cdf/Dashboard',
        'cdf/dashboard/Sprintf',
        'amd!cdf/lib/underscore',
        'cdf/lib/jquery',
        'cdf/lib/CCC/protovis-compat!',
        'amd!cdf/lib/datatables',
        'css!./dataBar'],

function(AddIn, Dashboard, sprintf, _, $, pv) {
    var stackedDataBar = {
        name: "stackedDataBar",
        label: "Stacked Data Bar",
        defaults: {
            width: undefined,
            widthRatio: 1,
            height: undefined,
            align: null,
            startColor: "#55A4D6",
            endColor: "#448FC8",
            backgroundImage: undefined,
            stroke: null,
            max: undefined,
            min: undefined,
            includeValue: false,
            absValue: true,
            stacked: false,
            stackedColors: ["#AAA","#BBB","#CCC"],
            valueFormat: function(v, format, st, opt) {
                return "" + sprintf(format || "%.0f", v);
            }
        },
        init: function() {
            $.fn.dataTableExt.oSort[this.name + '-asc'] = $.fn.dataTableExt.oSort['numeric-asc'];
            $.fn.dataTableExt.oSort[this.name + '-desc'] = $.fn.dataTableExt.oSort['numeric-desc'];
        },
        implementation: function(tgt, st, opt) {
            
            if ( opt.stacked ){
                
                //validate if we have values to render
                if ( st.value.length === 0 ) {
                    $(tgt).empty();
                    return
                };
                
                var colors = opt.stackedColors,
                    lColors = colors.length,
                    values = st.value.split(','),
                    length = values.length,
                    total = 0;
                
                //the colors available will be repeated to all values
                if ( lColors < length ){
                    for ( var i = 0; i <= length; i++ ){
                        var j = i;
                        if ( j > lColors ){
                            j = j - lColors - 1;
                            colors.push(colors[j]);
                        }
                    }
                }
                
                //determine width of bars
                _.each(values,function(value){
                    total = total + parseFloat(value);
                });
                
                var ratio = [];
                _.each(values,function(value){
                    var perc = value / total;
                    ratio.push(perc);
                });
                
                //determine cell size
                var cellSettings = this.cellSettings(tgt,opt);
                var ph = cellSettings[0];
                var wtmp = cellSettings[1] - 1;
                var htmp = cellSettings[2];
                var hasSVG = cellSettings[3];
                
                ph.css('min-width', ph.width() + 'px');
                
                //build stacked bars
                for ( var i = 0; i < length; i++ ){
                    var wbar = Math.floor(wtmp * ratio[i]);
                    if ( wbar > 0 ){
                        var phBar = $("<div></div>").addClass('stackedBar').appendTo(ph);
                        phBar.width(wbar);
                        phBar.css({'background':colors[i], "display": "block", "float": "left"});
                        //if we want to show values for each bar
                        if(opt.includeValue) {
                            var valueStr = opt.valueFormat(values[i], st.colFormat, st, opt);
                            if ( valueStr !== "0" ) {
                                var valph = $("<span></span>").addClass('value');
                                valph.append(valueStr);
                                phBar.append(valph);
                                phBar.find('span').width(wbar - 4);
                            }
                        }
                    }
                }
            } else {
                var tblMax = Math.max.apply(Math,st.tableData.map(function(e) {
                    return e[st.colIdx];
                })),
                tblMin = Math.min.apply(Math,st.tableData.map(function(e) {
                    return e[st.colIdx];
                }));
                
                var optMax = parseFloat(opt.max);
                var optMin = parseFloat(opt.min);
                
                var isValidNumber = function(nr) {
                    return _.isNumber(nr) && isFinite(nr);
                };
                
                var validMaxValue = isValidNumber(optMax);
                var validMinValue = isValidNumber(optMin);
                
                if(opt.absValue) {
                    var max = (validMaxValue == true) ? optMax : Math.max(Math.abs(tblMax), Math.abs(tblMin)),
                        min = (validMinValue == true) ? optMin : 0,
                        val = Math.abs(parseFloat(st.value));
                        min = Math.max(min,0);
                } else {
                    var max = (validMaxValue == true) ? optMax : Math.max(0, tblMax),
                        min = (validMinValue == true) ? optMin : Math.min(0, tblMin),
                        val = parseFloat(st.value);
                }
                
                //determine cell size
                var cellSettings = this.cellSettings(tgt,opt);
                var ph = cellSettings[0];
                var wtmp = cellSettings[1];
                var htmp = cellSettings[2];
                var hasSVG = cellSettings[3];
                
                var leftVal = Math.min(val, 0),
                    rightVal = Math.max(val, 0),
                    options = {
                        scale: 100,
                        wtmp: wtmp,
                        htmp: htmp,
                        align: opt.align,
                        barHeight: 100,
                        r: rightVal,
                        l: leftVal,
                        hasSVG: hasSVG,
                        target: ph.get(0),
                        processVal: function(val) { return val + '%'; }
                    },
                    c;
                // if we have SVG, and wtmp is a string, so probably a percentage width, will use percentage calculations
                if(hasSVG && typeof wtmp === 'string') {
                    c = this.drawPaper(min, max, options);
                } else {
                    // falling back to the default
                    options.processVal = function(val) { return val; };
                    options.scale = wtmp;
                    options.barHeight = htmp;
                    options.legacy = true;
                    c = this.drawPaper(min, max, options);
                }
                
                c.attr({
                    fill: opt.backgroundImage ? "url('" + opt.backgroundImage + "')" : "90-" + opt.startColor + "-" + opt.endColor,
                    stroke: opt.stroke,
                    title: "Value: " + st.value
                });
                
                if(opt.includeValue) {
                    var valueStr = opt.valueFormat(st.value, st.colFormat, st, opt);
                    var valph = $("<span></span>").addClass('value');
                    valph.append(valueStr);
                    if(options.legacy) {
                      valph.appendTo(ph);
                    } else if(hasSVG && opt.align == "right") {
                        valph.addClass('alignRight').appendTo(ph);
                        ph.find("svg").css('float', 'right');
                    } else {
                        valph.prependTo(ph);
                    }
                }
            }
        },
        cellSettings: function(tgt,opt){
            var hasSVG = !!(
                document.createElementNS &&
                document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect
            );
            
            var cell = $(tgt).empty();
            var ph = $("<div></div>").addClass('dataBarContainer').appendTo(cell);
            var wtmp = opt.width || ph.width();
            if(typeof wtmp === 'string') {
                if(!hasSVG) {
                    wtmp = ph.width() * opt.widthRatio;
                } else {
                    var parsedWidth = parseFloat(wtmp);
                    // if we have a widthRatio != 1, we want to apply it to a 100% width
                    parsedWidth = ((opt.widthRatio != 1 && parsedWidth >= 98) ? 100 : parsedWidth) * opt.widthRatio;
                    wtmp = parsedWidth + "%";
                }
            } else {
                wtmp *= opt.widthRatio;
            }
            var htmp = opt.height || ph.height();
            return [ph,wtmp,htmp,hasSVG];
        },
        drawPaper: function(min, max, opts) {
            // xx = x axis
            var xx = pv.Scale.linear(min,max).range(0, opts.scale);
            
            var paper = Raphael(
                opts.target,
                opts.legacy ? xx(Math.min(opts.r,max)) - xx(min) : opts.wtmp,
                opts.htmp);
            if(!opts.legacy && opts.hasSVG && opts.align == "right") {
                return paper.rect(
                opts.processVal(xx(max) - xx(opts.r)),
                opts.processVal(0),
                opts.processVal(xx(opts.r) - xx(opts.l)),
                opts.processVal(opts.barHeight));
            }
            return paper.rect(
                opts.processVal(xx(opts.l)),
                opts.processVal(0),
                opts.processVal(xx(opts.r) - xx(opts.l)),
                opts.processVal(opts.barHeight));
        }
    };
    
    Dashboard.registerGlobalAddIn("Table", "colType",  new AddIn(stackedDataBar));
    
    return stackedDataBar;
});