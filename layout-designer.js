var LayoutStartPos = 0;
var LeftPosition = -1;
var LayoutPaletteLength = 10;
var LayoutLeftOffset = parseInt($("#layoutLeftOffset").val())
var GridSpacing = $("#gridSpacing").val();
var MaxCompWidth = $("#displayWidth").val();
var MaxCompHeight = $("#displayHeight").val();

/*  alert(JSON.stringify(item, null, 4));*/

/**
 * Layout of components from defined warehouse layout..
 */
function buildLayout() {

    drawLayout();

    var resizeEnd;
    $(window).on('resize', function () {
        resizeEnd = setTimeout(function () {
            drawLayout();
        }, 500);
    });
}

/**
 * Layout Manager. 
 * Allows manual layout of components.
 */
function layoutManager() {

    designLayout();
    setButtons();

    $('#save').click(function () {
        saveLayout();
    });

    $("#left-arrow").click(function () {
        if (LayoutStartPos >= 1) {
            LayoutStartPos--;
            showHideLayouts();
            setButtons();
        }
    })

    $("#right-arrow").click(function () {
        if (LayoutStartPos + LayoutPaletteLength < getHighestBlockNo()) {
            LayoutStartPos++;
            showHideLayouts();
            setButtons();
        }
    })

    //  Recalc left positions....
    LeftPosition = document.getElementById('components').offsetLeft;

    var resizeEnd;
    $(window).on('resize', function () {
        resizeEnd = setTimeout(function () {
            leftRepostion();
            topReposition();
        }, 300);
    });

    $('#appbar').on('click', function () {
        clearTimeout(resizeEnd);
        resizeEnd = setTimeout(function () {
            leftRepostion();
            topReposition();
        }, 300);
    });
}

/*
    Draw the components on the fly.....
*/
function drawLayout() {

    // clear all components..
    const myNode = document.getElementById("components");
    myNode.innerHTML = '';


    var div = document.getElementById('components');
    var offsetTop = document.getElementById('components').offsetTop;
    var offsetLeft = document.getElementById('components').offsetLeft;

    var offsetWidth = document.getElementById('components').offsetWidth;
    var offsetHeight = document.getElementById('components').offsetHeight;

    var scale = offsetWidth / MaxCompWidth;

    // Resize height ..
    document.getElementById('components').style.height = (MaxCompHeight * scale) + "px";

    // Layout the components
    layoutComponents.forEach(function (item, index) {

        var name = item.LayoutDetails.Name;
        var image = item.LayoutDetails.Image;

        /* Home page setup */
        var s =
            '<div id="' + item.ID +
            '" name="' + name +
            '" class="resizeme layout-component-image " style="background-image:url(' + image + ' )"></div>';

        div.insertAdjacentHTML('afterbegin', s);

        var c = document.querySelector("[name='" + name + "']");
        c.style.top = (item.yPos * scale) + offsetTop + 'px';
        c.style.left = (item.xPos * scale) + offsetLeft + 'px';
        c.style.height = (item.Height * scale) + 'px';
        c.style.width = (item.Width * scale) + 'px';
    });
}
/*
    Design the layout required.
    Drag and drop components to the desired location.
*/
function designLayout() {

    var div = document.getElementById('components');
    var offsetTop = document.getElementById('components').offsetTop;
    var offsetLeft = document.getElementById('components').offsetLeft;

    // plot the layout components....
    layoutComponents.forEach(function (item, index) {

        // Blocks start at 1 so decrease to make life easier in calc of positions.
        var blockNo = item.LayoutDetails.BlockNo - 1;
        var name = item.LayoutDetails.Name;
        var c = document.querySelector("[name='" + name + "']");
        if (c == null) {
            var image = item.LayoutDetails.Image;
            var tooltip = item.LayoutDetails.Title;
            if (image != null) {
                if (item.yPos > 0 || (item.yPos == 0 && LayoutStartPos <= blockNo && LayoutStartPos + LayoutPaletteLength > blockNo)) {

                    var s =
                        '<div title="' + tooltip +
                        '" id="' + item.ID +
                        '" name="' + name +
                        '" class="resizeme layout-component-image " style="background-image:url(' + image + ' )"></div>';
                    div.insertAdjacentHTML('afterbegin', s);

                    var c = document.querySelector("[name='" + name + "']");
                    c.style.top = item.yPos + offsetTop + 'px';
                    c.style.left = item.xPos + offsetLeft + 'px';
                    c.style.width = item.Width + 'px';
                    c.style.height = item.Height + 'px';
                    if (item.yPos == 0) {
                        c.style.left = offsetLeft + ((blockNo - LayoutStartPos) * 120) + LayoutLeftOffset + 'px';
                    }
                } else {
                    /* Hide Layouts of current palette range until needed.*/
                    var s =
                        '<div title="' + tooltip +
                        '" id="' + item.ID +
                        '" name="' + name +
                        '" class="hide-layout-components resizeme layout-component-image " style="background-image:url(' + image + ' )"></div>';
                    div.insertAdjacentHTML('afterbegin', s);

                    var c = document.querySelector("[name='" + name + "']");
                    c.style.top = item.yPos + offsetTop + 'px';
                    c.style.left = offsetLeft + ((blockNo - LayoutStartPos) * 120) + LayoutLeftOffset + 'px';
                    c.style.width = item.Width + 'px';
                    c.style.height = item.Height + 'px';
                }
                dragInit(item);
            }
        }

    });

    /* Current selected layout component force to top */
    $(".resizeme").on("drag", function () {
        $(".resizeme").css('z-index', 0);
        $(this).css('z-index', 1);
    });
}
function reset(item) {

    var name = item.LayoutDetails.Name;
    var c = document.querySelector("[name='" + name + "']");

    c.style.top = 0;
    c.style.left = 0;
    c.style.width = item.LayoutDetails.Width + "px";
    c.style.height = item.LayoutDetails.Height + "px";

    showHideLayouts();
}
function showHideLayouts() {

    var formLayoutTop = document.getElementById('form-layout').offsetTop;
    var componentsTop = document.getElementById('components').offsetTop;
    var offsetLeft = document.getElementById('components').offsetLeft;

    layoutComponents.forEach(function (item, index) {
        var name = item.LayoutDetails.Name;
        var BlockNo = item.LayoutDetails.BlockNo - 1;
        var c = document.querySelector("[name='" + name + "']");
        if (c != null) {
            if (formLayoutTop > c.offsetTop) {
                /* Check current palette range */
                if (LayoutStartPos <= BlockNo && LayoutStartPos + LayoutPaletteLength > BlockNo) {
                    c.style.top = componentsTop + 'px';
                    c.style.left = offsetLeft + ((BlockNo - LayoutStartPos) * 120) + LayoutLeftOffset + 'px';
                    c.style.width = item.LayoutDetails.Width + "px";
                    c.style.height = item.LayoutDetails.Height + "px";
                    $("#" + item.ID).removeClass("hide-layout-components");
                } else {
                    /* Hide layout component out of palette range */
                    $("#" + item.ID).addClass("hide-layout-components");
                }
            }
        }
    });
}
/**
    Resize and Drag components..
 */
function dragInit(item) {

    // Allow resize if set to true...
    if (item.LayoutDetails.Resizable === true) {
        try {
            $("#" + item.ID).resizable({

                stop: function (e, ui) {

                    var name = item.LayoutDetails.Name;
                    var top = document.querySelector("[name='" + name + "']").offsetTop;
                    var cTop = document.getElementById("components").offsetTop;

                    if (top == cTop) {
                        reset(item);
                    }

                    var cWidth = document.querySelector("[name='" + name + "']").offsetWidth;
                    var cHeight = document.querySelector("[name='" + name + "']").offsetHeight;

                    var remainder = cWidth % GridSpacing;
                    if (remainder != 0) {
                        var c = document.querySelector("[name='" + name + "']");
                        var val = parseInt(c.style.width) + (GridSpacing - remainder);
                        c.style.width = val + "px";
                        dragParams(item);
                    }

                    var remainder = cHeight % GridSpacing;
                    if (remainder != 0) {
                        var c = document.querySelector("[name='" + name + "']");
                        var val = parseInt(c.style.height) + (GridSpacing - remainder);
                        c.style.height = val + "px";
                        dragParams(item);
                    }

                }
            });
        } catch (err) {

        }
    }

    try {
        $("#" + item.ID).draggable({
            stop: function (e, ui) {
                dragParams(item);
            }
        });
    } catch (err) {

    }
}
function dragParams(item) {

    var name = item.LayoutDetails.Name;

    var top = document.querySelector("[name='" + name + "']").offsetTop;
    var left = document.querySelector("[name='" + name + "']").offsetLeft;
    var width = document.querySelector("[name='" + name + "']").offsetWidth;
    var height = document.querySelector("[name='" + name + "']").offsetHeight;

    var cTop = document.getElementById("form-layout").offsetTop;
    var cLeft = document.getElementById("components").offsetLeft;
    var cWidth = document.getElementById("components").offsetWidth;

    /* Set nearest to grid lines. */
    var c = document.querySelector("[name='" + name + "']");
    if (c != null) {
        var layoutTop = parseInt(c.style.top);
        var remainder = (layoutTop - cTop) % GridSpacing
        if (remainder != 0) {
            var v = layoutTop - remainder;
            c.style.top = v + "px";
        }

        var layoutLeft = parseInt(c.style.left);
        var remainder = (layoutLeft - cLeft) % GridSpacing
        if (remainder != 0) {
            var v = layoutLeft - remainder;
            c.style.left = v + "px";
        }
    }

    if (left < cLeft) {
        reset(item);
    }

    if (top < cTop) {
        reset(item);
    }

    if ((left + width) > (cLeft + cWidth)) {
        reset(item);
    }

    var fTop = document.getElementById("form-layout").offsetTop;
    var fHeight = document.getElementById("form-layout").offsetHeight;
    if ((top + height) > (fTop + fHeight)) {
        reset(item);
    }
}
function leftRepostion() {

    var componentLeft = document.getElementById('components').offsetLeft;

    layoutComponents.forEach(function (item, index) {

        var name = item.LayoutDetails.Name;
        if (document.querySelector("[name='" + name + "']") != null) {
            var itemLeft = document.querySelector("[name='" + name + "']").offsetLeft;
            var v = LeftPosition - componentLeft;
            if (v > 0) {
                v = componentLeft - LeftPosition + itemLeft;
            } else {
                v = itemLeft - LeftPosition + componentLeft;
            }

            var c = document.querySelector("[name='" + name + "']");
            c.style.left = v + 'px';
        }

    });

    LeftPosition = componentLeft;
}
function topReposition() {

    var componentTop = document.getElementById('components').offsetTop;

    layoutComponents.forEach(function (item, index) {

        var name = item.LayoutDetails.Name;
        if (document.querySelector("[name='" + name + "']") != null) {
            var itemTop = document.querySelector("[name='" + name + "']").offsetTop;
            var v = topPosition - componentTop;
            if (v > 0) {
                v = componentTop - topPosition + itemTop;
            } else {
                v = itemTop - topPosition + componentTop;
            }

            var c = document.querySelector("[name='" + name + "']");
            c.style.top = v + 'px';
        }

    });

    // topPosition = componentTop;
}
function setButtons() {

    $('#left-arrow').removeClass('left-button');
    $('#left-arrow').removeClass('left-button-disabled');
    $('#right-arrow').removeClass('right-button');
    $('#right-arrow').removeClass('right-button-disabled');

    if (LayoutStartPos > 0) {
        $('#left-arrow').addClass('left-button');
    } else {
        $('#left-arrow').addClass('left-button-disabled');
    }

    if (getHighestBlockNo() > LayoutStartPos + LayoutPaletteLength) {
        $('#right-arrow').addClass('right-button');
    } else {
        $('#right-arrow').addClass('right-button-disabled');
    }

}

function getHighestBlockNo() {

    var val = 0;
    layoutComponents.forEach(function (item, index) {
        val = Math.max(val, item.LayoutDetails.BlockNo);
    });

    return val;
}

/*
    Save designed layout..
*/
function saveLayout() {

    var offsetTop = document.getElementById("components").offsetTop;
    var offsetLeft = document.getElementById("components").offsetLeft;
    var formLayout = document.getElementById("form-layout").offsetTop;

    /* alert(JSON.stringify(layoutComponents, null, 4));*/

    var arrayComponents = new Array();
    layoutComponents.forEach(function (item, index) {

        var name = item.LayoutDetails.Name;
        var component = document.querySelector("[name='" + name + "']");
        if (component != null) {
            var compTop = component.offsetTop - offsetTop;
            var compLeft = component.offsetLeft - offsetLeft;
            var compWidth = component.offsetWidth;
            var compHeight = component.offsetHeight;
            if (component.offsetTop < formLayout) {
                /* Reset layout component if not in range */
                compTop = 0;
                compLeft = (index * 120) + LayoutLeftOffset;
                compWidth = 100;
                compHeight = 100;
            }
            var LayoutComponent = { ID: item.ID, Top: compTop, Left: compLeft, Width: compWidth, Height: compHeight, LayoutDetails: { name: name } };
            arrayComponents.push(LayoutComponent);
        }
    });

    /*alert(JSON.stringify(arrayComponents, null, 4));*/
    var componentLayout = {
        "LayoutComponents": arrayComponents
    };

    $.ajax({
        type: 'POST',
        url: '/SaveLayout',
        data: JSON.stringify(componentLayout),
        contentType: "application/json",
        success: function (res) {
            alert("Save Compelete");
        }
    });
}