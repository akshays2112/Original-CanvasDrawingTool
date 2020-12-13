// Written by Akshay Srinivasan 2018
// Demystifying the unlimited potential of HTML Canvas element and the art of Geometry in Javascript 
//
// This javascript code is provided as is with no warranty implied.
// Akshay Srinivasan is not liable or responsible for any consequence of 
// using this code in your applications.
// You are free to use it and/ or change it for both commercial and non- commercial
// applications as long as you give credit to Akshay Srinivasan the creator 
// of this code.


"use strict";

var drawingCanvas, buttonCanvas, propertiesCanvas, drawingCanvasCtx, buttonCanvasCtx, propertiesCanvasCtx, currentSetOfPoints,
    currentEllipse, currentText, currentCurve, drawingCanvasLostFocus, buttonCanvasLostFocus, tmpCenter, mediaRecorder, currentBezierCurve;
var leftMouseButtonDown = false;
var rightMouseButtonDown = false;
var buttonCanvasLeftMouseButtonDown = false;
var propertiesCanvasLeftMouseButtonDown = false;
var selectedSetOfPointsIndex = -1;
var selectedEllipse = -1;
var selectedText = -1;
var selectedCurve = -1;
var selectedBezierCurve = -1;
var moveSetOfPointsIndex = -1;
var moveEllipseIndex = -1;
var moveTextIndex = -1;
var moveCurveIndex = -1;
var moveBezierCurveIndex = -1;
var lastMoveSetOfPointsX = 0;
var lastMoveSetOfPointsY = 0;
var lastMoveEllipseX = 0;
var lastMoveEllipseY = 0;
var lastMoveTextX = 0;
var lastMoveTextY = 0;
var lastMoveCurveX = 0;
var lastMoveCurveY = 0;
var lastMoveBezierCurveX = 0;
var lastMoveBezierCurveY = 0;
var allSetsOfPoints = new Array();
var allEllipses = new Array();
var allText = new Array();
var allCurves = new Array();
var allBezierCurves = new Array();
var scaleFactor = 1;
var originalPointsBeingScaled = new Array();
var tmpRotatedPoints = new Array();
var actionType = 'Pencil';
var buttons = new Array();
var selectedSetOfPointsColor = new Array();
var selectedEllipseColor = new Array();
var selectedTextColor = new Array();
var selectedCurveColor = new Array();
var selectedBezierCurveColor = new Array();
var currentSelectedColor = '#000000';
var isRecording = false;

function AddButton(x, y, width, height, imgSrcURL, imgSrcPressedURL, imgSrcMouseOverURL, state, actiontype, onclick) {
    var tmp = {
        X: x, Y: y, Width: width, Height: height, State: state, ActionType: actiontype, OnClick: onclick
    };
    var imgSrc = new Image();
    imgSrc.onload = function () {
        tmp.ImgSrc = imgSrc;
        Draw();
    };
    imgSrc.src = imgSrcURL;
    tmp.ImgSrc = imgSrc;
    var imgSrcPressed = new Image();
    imgSrcPressed.onload = function () {
        tmp.ImgSrcPressed = imgSrcPressed;
        Draw();
    };
    imgSrcPressed.src = imgSrcPressedURL;
    tmp.ImgSrcPressed = imgSrcPressed;
    var imgSrcMouseOver = new Image();
    imgSrcMouseOver.onload = function () {
        tmp.ImgSrcMouseOver = imgSrcMouseOver;
        Draw();
    };
    imgSrcMouseOver.src = imgSrcMouseOverURL;
    tmp.ImgSrcMouseOver = imgSrcMouseOver;
    buttons.push(tmp);
}

function FreeAllReferences() {
    selectedSetOfPointsIndex = -1;
    selectedEllipse = -1;
    selectedText = -1
    selectedCurve = -1;
    selectedBezierCurve = -1;
    currentSetOfPoints = null;
    currentEllipse = null;
    currentText = null;
    currentCurve = null;
    currentBezierCurve = null;
}

function drawingCanvasOnContextMenu(e) {
    if (currentCurve || currentBezierCurve) {
        e.preventDefault();
        return false;
    }
    return true;
}

function Setup() {
    drawingCanvas = document.getElementById('drawingCanvas');
    buttonCanvas = document.getElementById('buttonCanvas');
    propertiesCanvas = document.getElementById('propertiesCanvas');
    drawingCanvas.width = document.body.clientWidth - 230;
    drawingCanvas.height = document.body.clientHeight - 80;
    buttonCanvas.width = document.body.clientWidth - 20;
    propertiesCanvas.height = document.body.clientHeight - 80;
    drawingCanvasCtx = drawingCanvas.getContext('2d');
    buttonCanvasCtx = buttonCanvas.getContext('2d');
    propertiesCanvasCtx = propertiesCanvas.getContext('2d');
    drawingCanvas.addEventListener('mousedown', drawingCanvasOnMouseDown, false);
    drawingCanvas.addEventListener('mouseup', drawingCanvasOnMouseUp, false);
    drawingCanvas.addEventListener('mousemove', drawingCanvasOnMouseMove, false);
    drawingCanvas.addEventListener('mouseenter', drawingCanvasOnMouseEnter, false);
    drawingCanvas.addEventListener('mouseleave', drawingCanvasOnMouseLeave, false);
    drawingCanvas.addEventListener('wheel', drawingCanvasOnMouseWheel, false);
    drawingCanvas.addEventListener('keypress', drawingCanvasOnKeyPress, false);
    drawingCanvas.addEventListener('keyup', drawingCanvasOnKeyUp, false);
    drawingCanvas.addEventListener('contextmenu', drawingCanvasOnContextMenu, false);
    buttonCanvas.addEventListener('mousedown', buttonCanvasOnMouseDown, false);
    buttonCanvas.addEventListener('mouseup', buttonCanvasOnMouseUp, false);
    buttonCanvas.addEventListener('mousemove', buttonCanvasOnMouseMove, false);
    buttonCanvas.addEventListener('mouseleave', buttonCanvasOnMouseLeave, false);
    propertiesCanvas.addEventListener('mousedown', propertiesCanvasOnMouseDown, false);
    propertiesCanvas.addEventListener('mouseup', propertiesCanvasOnMouseUp, false);
    AddButton(5, 5, 50, 50, './Images/Pencil.png', './Images/PencilPressed.png', './Images/PencilMouseOver.png', 'Selected', 'Pencil');
    AddButton(65, 5, 50, 50, './Images/Select.png', './Images/SelectPressed.png', './Images/SelectMouseOver.png', 'UnSelected', 'Select');
    AddButton(125, 5, 50, 50, './Images/Delete.png', '', './Images/DeleteMouseOver.png', 'UnSelected', 'Delete',
        function () {
            if (selectedSetOfPointsIndex > -1 || selectedEllipse > -1 || selectedText > -1 || selectedCurve > -1 || selectedBezierCurve > -1) {
                if (selectedSetOfPointsIndex > -1) {
                    for (var j = 0; j < selectedSetOfPointsColor.length; j++) {
                        if (selectedSetOfPointsColor[j].Idx === selectedSetOfPointsIndex) {
                            selectedSetOfPointsColor.splice(j, 1);
                            break;
                        }
                    }
                    for (var d = 0; d < selectedSetOfPointsColor.length; d++) {
                        if (selectedSetOfPointsColor[d].Idx > selectedSetOfPointsIndex) {
                            selectedSetOfPointsColor[d].Idx--;
                        }
                    }
                    allSetsOfPoints.splice(selectedSetOfPointsIndex, 1);
                    FreeAllReferences();
                } else if (selectedEllipse > -1) {
                    for (var t = 0; t < selectedEllipseColor.length; t++) {
                        if (selectedEllipseColor[t].Idx === selectedEllipse) {
                            selectedEllipseColor.splice(t, 1);
                            break;
                        }
                    }
                    for (var s = 0; s < selectedEllipseColor.length; s++) {
                        if (selectedEllipseColor[s].Idx > selectedEllipse) {
                            selectedEllipseColor[s].Idx--;
                        }
                    }
                    allEllipses.splice(selectedEllipse, 1);
                    FreeAllReferences();
                } else if (selectedText > -1) {
                    for (var v = 0; v < selectedTextColor.length; v++) {
                        if (selectedTextColor[v].Idx === selectedText) {
                            selectedTextColor.splice(v, 1);
                            break;
                        }
                    }
                    for (var w = 0; w < selectedTextColor.length; w++) {
                        if (selectedTextColor[w].Idx > selectedText) {
                            selectedTextColor[w].Idx--;
                        }
                    }
                    allText.splice(selectedText, 1);
                    FreeAllReferences();
                } else if (selectedCurve > -1) {
                    for (var a = 0; a < selectedCurveColor.length; a++) {
                        if (selectedCurveColor[a].Idx === selectedCurve) {
                            selectedCurveColor.splice(a, 1);
                            break;
                        }
                    }
                    for (var r = 0; r < selectedCurveColor.length; r++) {
                        if (selectedCurveColor[r].Idx > selectedCurve) {
                            selectedCurveColor[r].Idx--;
                        }
                    }
                    allCurves.splice(selectedCurve, 1);
                    FreeAllReferences();
                } else if (selectedBezierCurve > -1) {
                    for (var a = 0; a < selectedBezierCurveColor.length; a++) {
                        if (selectedBezierCurveColor[a].Idx === selectedBezierCurve) {
                            selectedBezierCurveColor.splice(a, 1);
                            break;
                        }
                    }
                    for (var r = 0; r < selectedBezierCurveColor.length; r++) {
                        if (selectedBezierCurveColor[r].Idx > selectedBezierCurve) {
                            selectedBezierCurveColor[r].Idx--;
                        }
                    }
                    allBezierCurves.splice(selectedBezierCurve, 1);
                    FreeAllReferences();
                }
                Draw();
            }
        });
    AddButton(185, 5, 50, 50, './Images/Scale.png', './Images/ScalePressed.png', './Images/ScaleMouseOver.png', 'UnSelected', 'Scale');
    AddButton(245, 5, 50, 50, './Images/DrawLine.png', './Images/DrawLinePressed.png', './Images/DrawLineMouseOver.png', 'UnSelected', 'Line');
    AddButton(305, 5, 50, 50, './Images/VerticalLine.png', './Images/VerticalLinePressed.png', './Images/VerticalLineMouseOver.png',
        'UnSelected', 'VerticalLine');
    AddButton(365, 5, 50, 50, './Images/HorizontalLine.png', './Images/HorizontalLinePressed.png', './Images/HorizontalLineMouseOver.png',
        'UnSelected', 'HorizontalLine');
    AddButton(425, 5, 50, 50, './Images/Move.png', './Images/MovePressed.png', './Images/MoveMouseOver.png', 'UnSelected', 'Move');
    AddButton(485, 5, 50, 50, './Images/Rotation.png', './Images/RotationPressed.png', './Images/RotationMouseOver.png', 'UnSelected', 'Rotation');
    AddButton(545, 5, 50, 50, './Images/Rectangle.png', './Images/RectanglePressed.png', './Images/RectangleMouseOver.png', 'UnSelected', 'Rectangle');
    AddButton(605, 5, 50, 50, './Images/Ellipse.png', './Images/EllipsePressed.png', './Images/EllipseMouseOver.png', 'UnSelected', 'Ellipse');
    AddButton(665, 5, 50, 50, './Images/FlipVertical.png', '', './Images/FlipVerticalMouseOver.png', 'UnSelected', 'FlipVertical',
        function () {
            if (selectedSetOfPointsIndex > -1) {
                var tmpCG = CalculateCenterOfGravityXY(allSetsOfPoints[selectedSetOfPointsIndex]);
                for (var i = 0; i < allSetsOfPoints[selectedSetOfPointsIndex].length; i++) {
                    var tmpY = allSetsOfPoints[selectedSetOfPointsIndex][i].y;
                    if (tmpY < tmpCG.Y) {
                        allSetsOfPoints[selectedSetOfPointsIndex][i].y = tmpY + 2 * Math.abs(tmpY - tmpCG.Y);
                    } else if (tmpY > tmpCG.Y) {
                        allSetsOfPoints[selectedSetOfPointsIndex][i].y = tmpY - 2 * Math.abs(tmpY - tmpCG.Y);
                    }
                }
                Draw();
            } else if (selectedText > -1) {
                if (allText[selectedText].FlipVertical) {
                    allText[selectedText].FlipVertical = false;
                } else {
                    allText[selectedText].FlipVertical = true;
                }
                Draw();
            } else if (selectedCurve > -1) {
                var tmpCenterY = (allCurves[selectedCurve].StartY + allCurves[selectedCurve].EndY) / 2;
                if (allCurves[selectedCurve].StartY < tmpCenterY) {
                    allCurves[selectedCurve].StartY = allCurves[selectedCurve].StartY + 2 * Math.abs(allCurves[selectedCurve].StartY - tmpCenterY);
                } else if (allCurves[selectedCurve].StartY > tmpCenterY) {
                    allCurves[selectedCurve].StartY = allCurves[selectedCurve].StartY - 2 * Math.abs(allCurves[selectedCurve].StartY - tmpCenterY);
                }
                if (allCurves[selectedCurve].ControlPointY < tmpCenterY) {
                    allCurves[selectedCurve].ControlPointY = allCurves[selectedCurve].ControlPointY + 2 * Math.abs(allCurves[selectedCurve].ControlPointY - tmpCenterY);
                } else if (allCurves[selectedCurve].ControlPointY > tmpCenterY) {
                    allCurves[selectedCurve].ControlPointY = allCurves[selectedCurve].ControlPointY - 2 * Math.abs(allCurves[selectedCurve].ControlPointY - tmpCenterY);
                }
                if (allCurves[selectedCurve].EndY < tmpCenterY) {
                    allCurves[selectedCurve].EndY = allCurves[selectedCurve].EndY + 2 * Math.abs(allCurves[selectedCurve].EndY - tmpCenterY);
                } else if (allCurves[selectedCurve].EndY > tmpCenterY) {
                    allCurves[selectedCurve].EndY = allCurves[selectedCurve].EndY - 2 * Math.abs(allCurves[selectedCurve].EndY - tmpCenterY);
                }
                Draw();
            } else if (selectedBezierCurve > -1) {
                var tmpCenterY2 = (allBezierCurves[selectedBezierCurve].StartY +
                    allBezierCurves[selectedBezierCurve].EndY) / 2;
                if (allBezierCurves[selectedBezierCurve].StartY < tmpCenterY2) {
                    allBezierCurves[selectedBezierCurve].StartY = allBezierCurves[selectedBezierCurve].StartY +
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].StartY - tmpCenterY2);
                } else if (allBezierCurves[selectedBezierCurve].StartY > tmpCenterY2) {
                    allBezierCurves[selectedBezierCurve].StartY = allBezierCurves[selectedBezierCurve].StartY -
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].StartY - tmpCenterY2);
                }
                if (allBezierCurves[selectedBezierCurve].ControlPoint1Y < tmpCenterY2) {
                    allBezierCurves[selectedBezierCurve].ControlPoint1Y =
                        allBezierCurves[selectedBezierCurve].ControlPoint1Y +
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].ControlPoint1Y - tmpCenterY2);
                } else if (allBezierCurves[selectedBezierCurve].ControlPoint1Y > tmpCenterY2) {
                    allBezierCurves[selectedBezierCurve].ControlPoint1Y =
                        allBezierCurves[selectedBezierCurve].ControlPoint1Y -
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].ControlPoint1Y - tmpCenterY2);
                }
                if (allBezierCurves[selectedBezierCurve].ControlPoint2Y < tmpCenterY2) {
                    allBezierCurves[selectedBezierCurve].ControlPoint2Y =
                        allBezierCurves[selectedBezierCurve].ControlPoint2Y +
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].ControlPoint2Y - tmpCenterY2);
                } else if (allBezierCurves[selectedBezierCurve].ControlPoint2Y > tmpCenterY2) {
                    allBezierCurves[selectedBezierCurve].ControlPoint2Y =
                        allBezierCurves[selectedBezierCurve].ControlPoint2Y -
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].ControlPoint2Y - tmpCenterY2);
                }
                if (allBezierCurves[selectedBezierCurve].EndY < tmpCenterY2) {
                    allBezierCurves[selectedBezierCurve].EndY = allBezierCurves[selectedBezierCurve].EndY +
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].EndY - tmpCenterY2);
                } else if (allBezierCurves[selectedBezierCurve].EndY > tmpCenterY2) {
                    allBezierCurves[selectedBezierCurve].EndY = allBezierCurves[selectedBezierCurve].EndY -
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].EndY - tmpCenterY2);
                }
                Draw();
            } else if (selectedEllipse > -1) {
                var tmpY2 = Math.sin(allEllipses[selectedEllipse].Angle) * 100;
                allEllipses[selectedEllipse].Angle = Math.asin((-tmpY2) / 100);
                Draw();
            }
        });
    AddButton(725, 5, 50, 50, './Images/FlipHorizontal.png', '', './Images/FlipHorizontalMouseOver.png', 'UnSelected', 'FlipHorizontal',
        function () {
            if (selectedSetOfPointsIndex > -1) {
                var tmpCG = CalculateCenterOfGravityXY(allSetsOfPoints[selectedSetOfPointsIndex]);
                for (var i = 0; i < allSetsOfPoints[selectedSetOfPointsIndex].length; i++) {
                    var tmpX = allSetsOfPoints[selectedSetOfPointsIndex][i].x;
                    if (tmpX < tmpCG.X) {
                        allSetsOfPoints[selectedSetOfPointsIndex][i].x = tmpX + 2 * Math.abs(tmpX - tmpCG.X);
                    } else if (tmpX > tmpCG.X) {
                        allSetsOfPoints[selectedSetOfPointsIndex][i].x = tmpX - 2 * Math.abs(tmpX - tmpCG.X);
                    }
                }
                Draw();
            } else if (selectedText > -1) {
                if (allText[selectedText].FlipHorizontal) {
                    allText[selectedText].FlipHorizontal = false;
                } else {
                    allText[selectedText].FlipHorizontal = true;
                }
                Draw();
            } else if (selectedCurve > -1) {
                var tmpCenterX = (allCurves[selectedCurve].StartX + allCurves[selectedCurve].EndX) / 2;
                if (allCurves[selectedCurve].StartX < tmpCenterX) {
                    allCurves[selectedCurve].StartX = allCurves[selectedCurve].StartX + 2 * Math.abs(allCurves[selectedCurve].StartX - tmpCenterX);
                } else if (allCurves[selectedCurve].StartX > tmpCenterX) {
                    allCurves[selectedCurve].StartX = allCurves[selectedCurve].StartX - 2 * Math.abs(allCurves[selectedCurve].StartX - tmpCenterX);
                }
                if (allCurves[selectedCurve].ControlPointX < tmpCenterX) {
                    allCurves[selectedCurve].ControlPointX = allCurves[selectedCurve].ControlPointX +
                        2 * Math.abs(allCurves[selectedCurve].ControlPointX - tmpCenterX);
                } else if (allCurves[selectedCurve].ControlPointX > tmpCenterX) {
                    allCurves[selectedCurve].ControlPointX = allCurves[selectedCurve].ControlPointX -
                        2 * Math.abs(allCurves[selectedCurve].ControlPointX - tmpCenterX);
                }
                if (allCurves[selectedCurve].EndX < tmpCenterX) {
                    allCurves[selectedCurve].EndX = allCurves[selectedCurve].EndX + 2 * Math.abs(allCurves[selectedCurve].EndX - tmpCenterX);
                } else if (allCurves[selectedCurve].EndX > tmpCenterX) {
                    allCurves[selectedCurve].EndX = allCurves[selectedCurve].EndX - 2 * Math.abs(allCurves[selectedCurve].EndX - tmpCenterX);
                }
                Draw();
            } else if (selectedBezierCurve > -1) {
                var tmpCenterX2 = (allBezierCurves[selectedBezierCurve].StartX +
                    allBezierCurves[selectedBezierCurve].EndX) / 2;
                if (allBezierCurves[selectedBezierCurve].StartX < tmpCenterX2) {
                    allBezierCurves[selectedBezierCurve].StartX = allBezierCurves[selectedBezierCurve].StartX +
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].StartX - tmpCenterX2);
                } else if (allBezierCurves[selectedBezierCurve].StartX > tmpCenterX2) {
                    allBezierCurves[selectedBezierCurve].StartX = allBezierCurves[selectedBezierCurve].StartX -
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].StartX - tmpCenterX2);
                }
                if (allBezierCurves[selectedBezierCurve].ControlPoint1X < tmpCenterX2) {
                    allBezierCurves[selectedBezierCurve].ControlPoint1X =
                        allBezierCurves[selectedBezierCurve].ControlPoint1X +
                    2 * Math.abs(allBezierCurves[selectedBezierCurve].ControlPoint1X - tmpCenterX2);
                } else if (allBezierCurves[selectedBezierCurve].ControlPoint1X > tmpCenterX2) {
                    allBezierCurves[selectedBezierCurve].ControlPoint1X =
                        allBezierCurves[selectedBezierCurve].ControlPoint1X -
                    2 * Math.abs(allBezierCurves[selectedBezierCurve].ControlPoint1X - tmpCenterX2);
                }
                if (allBezierCurves[selectedBezierCurve].ControlPoint2X < tmpCenterX2) {
                    allBezierCurves[selectedBezierCurve].ControlPoint2X =
                        allBezierCurves[selectedBezierCurve].ControlPoint2X +
                    2 * Math.abs(allBezierCurves[selectedBezierCurve].ControlPoint2X - tmpCenterX2);
                } else if (allBezierCurves[selectedBezierCurve].ControlPoint2X > tmpCenterX2) {
                    allBezierCurves[selectedBezierCurve].ControlPoint2X =
                        allBezierCurves[selectedBezierCurve].ControlPoint2X -
                    2 * Math.abs(allBezierCurves[selectedBezierCurve].ControlPoint2X - tmpCenterX2);
                }
                if (allBezierCurves[selectedBezierCurve].EndX < tmpCenterX2) {
                    allBezierCurves[selectedBezierCurve].EndX = allBezierCurves[selectedBezierCurve].EndX +
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].EndX - tmpCenterX2);
                } else if (allBezierCurves[selectedBezierCurve].EndX > tmpCenterX2) {
                    allBezierCurves[selectedBezierCurve].EndX = allBezierCurves[selectedBezierCurve].EndX -
                        2 * Math.abs(allBezierCurves[selectedBezierCurve].EndX - tmpCenterX2);
                }
                Draw();
            } else if (selectedEllipse > -1) {
                var tmpX2 = Math.cos(allEllipses[selectedEllipse].Angle) * 100;
                allEllipses[selectedEllipse].Angle = Math.acos((-tmpX2) / 100);
                Draw();
            }
        });
    AddButton(785, 5, 50, 50, './Images/ColorPicker.png', './Images/ColorPickerPressed.png', './Images/ColorPickerMouseOver.png', 'UnSelected', 'ColorPicker');
    AddButton(845, 5, 50, 50, './Images/Text.png', './Images/TextPressed.png', './Images/TextMouseOver.png', 'UnSelected', 'Text');
    AddButton(905, 5, 50, 50, './Images/CopyJStoClipboard.png', '', './Images/CopyJStoClipboardMouseOver.png', 'UnSelected', 'CopyJStoClipboard',
        function () {
            var codeString = 'var myDrawingPoints = new Array(), myDrawingPointsColors = new Array(), myDrawingEllipses = new Array(), ' +
                'myDrawingEllipsesColors = new Array(), myDrawingTexts = new Array(), myDrawingTextsColors = new Array(), ' +
                'myDrawingCurves = new Array(), myDrawingCurvesColors = new Array(), myDrawingBezierCurves = new Array(), myDrawingBezierCurvesColors = ' +
                'new Array();\n';
            if (allSetsOfPoints.length > 0) {
                codeString += 'myDrawingPoints = [';
                for (var i = 0; i < allSetsOfPoints.length - 1; i++) {
                    codeString += '[';
                    for (var j = 0; j < allSetsOfPoints[i].length - 1; j++) {
                        codeString += '{ x: ' + allSetsOfPoints[i][j].x + ', y: ' + allSetsOfPoints[i][j].y + ' }, ';
                    }
                    codeString += '{ x: ' + allSetsOfPoints[i][j].x + ', y: ' + allSetsOfPoints[i][j].y + ' }], ';
                }
                codeString += '[';
                for (var f = 0; f < allSetsOfPoints[allSetsOfPoints.length - 1].length - 1; f++) {
                    codeString += '{ x: ' + allSetsOfPoints[allSetsOfPoints.length - 1][f].x + ', y: ' +
                        allSetsOfPoints[allSetsOfPoints.length - 1][f].y + ' }, ';
                }
                codeString += '{ x: ' + allSetsOfPoints[allSetsOfPoints.length - 1][allSetsOfPoints[allSetsOfPoints.length - 1].length - 1].x + ', y: ' +
                    allSetsOfPoints[allSetsOfPoints.length - 1][allSetsOfPoints[allSetsOfPoints.length - 1].length - 1].y + ' }]];\n';
                if (selectedSetOfPointsColor.length > 0) {
                    codeString += 'myDrawingPointsColors = [';
                    for (var u = 0; u < selectedSetOfPointsColor.length - 1; u++) {
                        codeString += '{ Idx: ' + selectedSetOfPointsColor[u].Idx + ', Color: \'' + selectedSetOfPointsColor[u].Color + '\' }, ';
                    }
                    codeString += '{ Idx: ' + selectedSetOfPointsColor[selectedSetOfPointsColor.length - 1].Idx +
                        ', Color: \'' + selectedSetOfPointsColor[selectedSetOfPointsColor.length - 1].Color + '\' }];\n';
                }
            }
            if (allEllipses.length > 0) {
                codeString += 'myDrawingEllipses = [';
                for (var d = 0; d < allEllipses.length - 1; d++) {
                    codeString += '{ CenterX: ' + allEllipses[d].CenterX + ', CenterY: ' + allEllipses[d].CenterY +
                        ', SemiMajorAxisLength: ' + allEllipses[d].SemiMajorAxisLength + ', SemiMinorAxisLength: ' +
                        allEllipses[d].SemiMinorAxisLength + ',  Angle: ' + allEllipses[d].Angle + ', StartAngle: 0, EndAngle: 2 * Math.PI }, ';
                }
                codeString += '{ CenterX: ' + allEllipses[allEllipses.length - 1].CenterX + ', CenterY: ' +
                    allEllipses[allEllipses.length - 1].CenterY + ', SemiMajorAxisLength: ' + allEllipses[allEllipses.length - 1].SemiMajorAxisLength +
                    ', SemiMinorAxisLength: ' + allEllipses[allEllipses.length - 1].SemiMinorAxisLength + ', Angle: ' +
                    allEllipses[allEllipses.length - 1].Angle + ', StartAngle: 0, EndAngle: 2 * Math.PI }]; \n';
                if (selectedEllipseColor.length > 0) {
                    codeString += 'myDrawingEllipsesColors = [';
                    for (var a = 0; a < selectedEllipseColor.length - 1; a++) {
                        codeString += '{ Idx: ' + selectedEllipseColor[a].Idx + ', Color: \'' + selectedEllipseColor[a].Color + '\' }, ';
                    }
                    codeString += '{ Idx: ' + selectedEllipseColor[selectedEllipseColor.length - 1].Idx +
                        ', Color: \'' + selectedEllipseColor[selectedEllipseColor.length - 1].Color + '\' }];\n';
                }
            }
            if (allText.length > 0) {
                codeString += 'myDrawingTexts = [';
                for (var k = 0; k < allText.length - 1; k++) {
                    codeString += '{ X: ' + allText[k].X + ', Y: ' + allText[k].Y + ', Value: \'' + allText[k].Value +
                        '\', FontSize: ' + allText[k].FontSize + ', FontName: \'' + allText[k].FontName + '\', Width: ' +
                        allText[k].Width + ', Angle: ' + (allText[k].Angle ? allText[k].Angle : 0) +
                        ', FlipHorizontal: ' + (allText[k].FlipHorizontal ? allText[k].FlipHorizontal : false) +
                        ', FlipVertical: ' + (allText[k].FlipVertical ? allText[k].FlipVertical : false) + ' }, ';
                }
                codeString += '{ X: ' + allText[allText.length - 1].X + ', Y: ' + allText[allText.length - 1].Y +
                    ', Value: \'' + allText[allText.length - 1].Value + '\', FontSize: ' + allText[allText.length - 1].FontSize +
                    ', FontName: \'' + allText[allText.length - 1].FontName + '\', Width: ' + allText[allText.length - 1].Width +
                    ', Angle: ' + (allText[allText.length - 1].Angle ? allText[allText.length - 1].Angle : 0) + ', FlipHorizontal: ' +
                    (allText[allText.length - 1].FlipHorizontal ? allText[allText.length - 1].FlipHorizontal : false) + ', FlipVertical: ' +
                    (allText[allText.length - 1].FlipVertical ? allText[allText.length - 1].FlipVertical : false) + ' }];\n';
                if (selectedTextColor.length > 0) {
                    codeString += 'myDrawingTextsColors = [';
                    for (var h = 0; h < selectedTextColor.length - 1; h++) {
                        codeString += '{ Idx: ' + selectedTextColor[h].Idx + ', Color: \'' + selectedTextColor[h].Color + '\' }, ';
                    }
                    codeString += '{ Idx: ' + selectedTextColor[selectedTextColor.length - 1].Idx +
                        ', Color: \'' + selectedTextColor[selectedTextColor.length - 1].Color + '\' }];\n';
                }
            }
            if (allCurves.length > 0) {
                codeString += 'myDrawingCurves = [';
                for (var g = 0; g < allCurves.length - 1; g++) {
                    codeString += '{ StartX: ' + allCurves[g].StartX + ', StartY: ' + allCurves[g].StartY + ', ControlPointX: ' +
                        allCurves[g].ControlPointX + ', ControlPointY: ' + allCurves[g].ControlPointY + ', EndX: ' +
                        allCurves[g].EndX + ', EndY: ' + allCurves[g].EndY + ' }, ';
                }
                codeString += '{ StartX: ' + allCurves[allCurves.length - 1].StartX + ', StartY: ' +
                    allCurves[allCurves.length - 1].StartY + ', ControlPointX: ' +
                    allCurves[allCurves.length - 1].ControlPointX + ', ControlPointY: ' + allCurves[allCurves.length - 1].ControlPointY + ', EndX: ' +
                    allCurves[allCurves.length - 1].EndX + ', EndY: ' + allCurves[allCurves.length - 1].EndY + ' }];\n';
                if (selectedCurveColor.length > 0) {
                    codeString += 'myDrawingCurvesColors = [';
                    for (var v = 0; v < selectedCurveColor.length - 1; v++) {
                        codeString += '{ Idx: ' + selectedCurveColor[v].Idx + ', Color: \'' + selectedCurveColor[v].Color + '\' }, ';
                    }
                    codeString += '{ Idx: ' + selectedCurveColor[selectedCurveColor.length - 1].Idx +
                        ', Color: \'' + selectedCurveColor[selectedCurveColor.length - 1].Color + '\' }];\n';
                }
            }
            if (allBezierCurves.length > 0) {
                codeString += 'myDrawingBezierCurves = [';
                for (var g = 0; g < allBezierCurves.length - 1; g++) {
                    codeString += '{ StartX: ' + allBezierCurves[g].StartX + ', StartY: ' +
                        allBezierCurves[g].StartY + ', ControlPoint1X: ' +
                        allBezierCurves[g].ControlPoint1X + ', ControlPoint1Y: ' +
                        allBezierCurves[g].ControlPoint1Y + ', ControlPoint2X: ' +
                        allBezierCurves[g].ControlPoint2X + ', ControlPoint2Y: ' +
                        allBezierCurves[g].ControlPoint2Y + ', EndX: ' +
                        allBezierCurves[g].EndX + ', EndY: ' + allBezierCurves[g].EndY + ' }, ';
                }
                codeString += '{ StartX: ' + allBezierCurves[allBezierCurves.length - 1].StartX + ', StartY: ' +
                    allBezierCurves[allBezierCurves.length - 1].StartY + ', ControlPoint1X: ' +
                    allBezierCurves[allBezierCurves.length - 1].ControlPoint1X + ', ControlPoint1Y: ' +
                    allBezierCurves[allBezierCurves.length - 1].ControlPoint1Y + ', ControlPoint2X: ' +
                    allBezierCurves[allBezierCurves.length - 1].ControlPoint2X + ', ControlPoint2Y: ' +
                    allBezierCurves[allBezierCurves.length - 1].ControlPoint2Y + ', EndX: ' +
                    allBezierCurves[allBezierCurves.length - 1].EndX + ', EndY: ' +
                    allBezierCurves[allBezierCurves.length - 1].EndY + ' }];\n';
                if (selectedBezierCurveColor.length > 0) {
                    codeString += 'myDrawingBezierCurvesColors = [';
                    for (var v = 0; v < selectedBezierCurveColor.length - 1; v++) {
                        codeString += '{ Idx: ' + selectedBezierCurveColor[v].Idx + ', Color: \'' +
                            selectedBezierCurveColor[v].Color + '\' }, ';
                    }
                    codeString += '{ Idx: ' + selectedBezierCurveColor[
                        selectedBezierCurveColor.length - 1].Idx +
                        ', Color: \'' + selectedBezierCurveColor[
                            selectedBezierCurveColor.length - 1].Color + '\' }];\n';
                }
            }
            codeString += 'c = document.getElementById(\'YourCanvasIDName\');\nctx = c.getContext(\'2d\');\n' +
                'for (var i = 0; i < myDrawingPoints.length; i++) {\n\tif (myDrawingPoints[i].length > 1) {\n' +
                '\t\tctx.beginPath();\n\t\tctx.moveTo(myDrawingPoints[i][0].x, myDrawingPoints[i][0].y);\n\t\t' +
                'for (var j = 1; j < myDrawingPoints[i].length; j++) {\n\t\t\tctx.lineTo(myDrawingPoints[i][j].x, myDrawingPoints[i][j].y);\n' +
                '\t\t}\n\t\tvar setColor = false;\n\t\tfor (var r = 0; r < myDrawingPointsColors.length; r++) {\n' +
                '\t\t\tif (myDrawingPointsColors[r].Idx === i) {\n\t\t\t\tctx.strokeStyle = myDrawingPointsColors[r].Color;\n' +
                '\t\t\t\tsetColor = true;\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\t\tif (!setColor) {\n\t\t\tctx.strokeStyle = \'#000000\';\n\t\t}\n' +
                '\t\tctx.stroke();\n\t}\n}\n';
            codeString += 'for (var t = 0; t < myDrawingEllipses.length; t++) {\n\tctx.beginPath();\n\t' +
                'ctx.ellipse(myDrawingEllipses[t].CenterX,\n\t' +
                'myDrawingEllipses[t].CenterY,\n\t' +
                'myDrawingEllipses[t].SemiMajorAxisLength,\n\t' +
                'myDrawingEllipses[t].SemiMinorAxisLength,\n\t' +
                'myDrawingEllipses[t].Angle, myDrawingEllipses[t].StartAngle, myDrawingEllipses[t].EndAngle, 0);\n\t' +
                'var setColor2 = false;\n\tfor (var q = 0; q < myDrawingEllipsesColors.length; q++) {\n\t\t' +
                'if (myDrawingEllipsesColors[q].Idx === t) {\n\t\t\tctx.strokeStyle = myDrawingEllipsesColors[q].Color;\n\t\t\t' +
                'setColor2 = true;\n\t\t\tbreak;\n\t\t}\n\t}\n\tif (!setColor2) {\n\t\tctx.strokeStyle = \'#000000\';\n\t}\n\t' +
                'ctx.stroke();\n}\n';
            codeString += 'for (var d = 0; d < myDrawingTexts.length; d++) {\n\tvar setColor3 = false;\n\t' +
                'for (var u = 0; u < myDrawingTextsColors.length; u++) {\n\t\tif (myDrawingTextsColors[u].Idx === d) {\n\t\t\t' +
                'ctx.fillStyle = myDrawingTextsColors[u].Color;\n\t\t\tsetColor3 = true;\n\t\t\tbreak;\n\t\t}\n\t}\n\t' +
                'if (!setColor3) {\n\t\tctx.fillStyle = \'#000000\';\n\t}\n\t' +
                'ctx.font = myDrawingTexts[d].FontSize + \'px \' + myDrawingTexts[d].FontName;\n\tctx.save();\n\t' +
                'ctx.translate(myDrawingTexts[d].X + myDrawingTexts[d].Width / 2, myDrawingTexts[d].Y + myDrawingTexts[d].FontSize / 2);\n\t' +
                'if (myDrawingTexts[d].Angle !== 0) {\n\t\tif (myDrawingTexts[d].Angle < 0) {\n\t\t\tctx.rotate(2 * Math.PI + myDrawingTexts[d].Angle);\n\t\t' +
                '} else {\n\t\t\tctx.rotate(myDrawingTexts[d].Angle);\n\t\t}\n\t}\n\tif (myDrawingTexts[d].FlipHorizontal) {\n\t\tctx.scale(-1, 1);\n\t' +
                '}\n\tif (myDrawingTexts[d].FlipVertical) {\n\t\tctx.scale(1, -1);\n\t}\n\t' +
                'ctx.fillText(myDrawingTexts[d].Value, -myDrawingTexts[d].Width / 2, -myDrawingTexts[d].FontSize / 2);\n\tctx.restore();\n}\n';
            codeString += 'for (var a = 0; a < myDrawingCurves.length; a++) {\n\tctx.beginPath();\n\tctx.moveTo(myDrawingCurves[a].StartX, ' +
                'myDrawingCurves[a].StartY); \n\tctx.quadraticCurveTo(myDrawingCurves[a].ControlPointX, ' +
                'myDrawingCurves[a].ControlPointY, myDrawingCurves[a].EndX, myDrawingCurves[a].EndY);\n\tvar setColor4 = false;\n\t' +
                'for (var g = 0; g < myDrawingCurvesColors.length; g++) {\n\t\tif (myDrawingCurvesColors[g].Idx === a) {\n\t\t\t' +
                'ctx.strokeStyle = myDrawingCurvesColors[g].Color;\n\t\t\tsetColor4 = true;\n\t\t\tbreak;\n\t\t}\n\t}\n\tif (!setColor4) {\n\t\t' +
                'ctx.strokeStyle = \'#000000\';\n\t}\n\tctx.stroke();\n}\n';
            codeString += 'for (var a = 0; a < myDrawingBezierCurves.length; a++) {\n\tctx.beginPath();\n\tctx.moveTo(myDrawingBezierCurves[a].StartX, ' +
                'myDrawingBezierCurves[a].StartY); \n\tctx.bezierCurveTo(myDrawingBezierCurves[a].ControlPoint1X, ' +
                'myDrawingBezierCurves[a].ControlPoint1Y, myDrawingBezierCurves[a].ControlPoint2X, myDrawingBezierCurves[a].ControlPoint2Y, ' +
                'myDrawingBezierCurves[a].EndX, myDrawingBezierCurves[a].EndY); \n\tvar setColor4 = false; \n\t' +
                'for (var g = 0; g < myDrawingBezierCurvesColors.length; g++) {\n\t\tif (myDrawingBezierCurvesColors[g].Idx === a) {\n\t\t\t' +
                'ctx.strokeStyle = myDrawingBezierCurvesColors[g].Color;\n\t\t\tsetColor4 = true;\n\t\t\tbreak;\n\t\t}\n\t}\n\tif (!setColor4) {\n\t\t' +
                'ctx.strokeStyle = \'#000000\';\n\t}\n\tctx.stroke();\n}\n';
            CopyToClipboard(codeString);
        });
    AddButton(965, 5, 50, 50, './Images/SaveImage.png', '', './Images/SaveImageMouseOver.png', 'UnSelected', 'SaveImage',
        function () {
            drawingCanvas.toBlob(function (file) {
                var filename = 'MyCanvasDrawingToolDrawing.png';
                if (window.navigator.msSaveOrOpenBlob) // IE10+
                    window.navigator.msSaveOrOpenBlob(file, filename);
                else { // Others
                    var a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    }, 0);
                }
            });
        });
    AddButton(1025, 5, 50, 50, './Images/Copy.png', '', './Images/CopyMouseOver.png', 'UnSelected', 'Copy',
        function () {
            if (selectedSetOfPointsIndex > -1) {
                var tmp = new Array();
                for (var i = 0; i < allSetsOfPoints[selectedSetOfPointsIndex].length; i++) {
                    tmp.push({ x: allSetsOfPoints[selectedSetOfPointsIndex][i].x, y: allSetsOfPoints[selectedSetOfPointsIndex][i].y });
                }
                allSetsOfPoints.push(tmp);
                selectedSetOfPointsColor.push({ Idx: allSetsOfPoints.length - 1, Color: selectedSetOfPointsColor[selectedSetOfPointsIndex].Color });
            } else if (selectedEllipse > -1) {
                allEllipses.push({
                    TopLeftX: allEllipses[selectedEllipse].TopLeftX, TopLeftY: allEllipses[selectedEllipse].TopLeftY,
                    BottomRightX: allEllipses[selectedEllipse].BottomRightX, BottomRightY: allEllipses[selectedEllipse].BottomRightY,
                    Angle: allEllipses[selectedEllipse].Angle, StartAngle: allEllipses[selectedEllipse].StartAngle,
                    EndAngle: allEllipses[selectedEllipse].EndAngle, CenterX: allEllipses[selectedEllipse].CenterX,
                    CenterY: allEllipses[selectedEllipse].CenterY, SemiMajorAxisLength: allEllipses[selectedEllipse].SemiMajorAxisLength,
                    SemiMinorAxisLength: allEllipses[selectedEllipse].SemiMinorAxisLength
                });
                selectedEllipseColor.push({ Idx: allEllipses.length - 1, Color: selectedEllipseColor[selectedEllipse].Color });
            } else if (selectedText > -1) {
                allText.push({
                    X: allText[selectedText].X, Y: allText[selectedText].Y, Value: allText[selectedText].Value,
                    FontSize: allText[selectedText].FontSize, FontName: allText[selectedText].FontName,
                    Width: allText[selectedText].Width
                });
                selectedTextColor.push({ Idx: allText.length - 1, Color: selectedTextColor[selectedText].Color });
            } else if (selectedCurve > -1) {
                allCurves.push({
                    StartX: allCurves[selectedCurve].StartX, StartY: allCurves[selectedCurve].StartY,
                    ControlPointX: allCurves[selectedCurve].ControlPointX, ControlPointY: allCurves[selectedCurve].ControlPointY,
                    EndX: allCurves[selectedCurve].EndX, EndY: allCurves[selectedCurve].EndY, Editing: -1
                });
                selectedCurveColor.push({ Idx: allCurves.length - 1, Color: selectedCurveColor[selectedCurve].Color });
            } else if (selectedBezierCurve > -1) {
                allBezierCurves.push({
                    StartX: allBezierCurves[selectedBezierCurve].StartX,
                    StartY: allBezierCurves[selectedBezierCurve].StartY,
                    ControlPoint1X: allBezierCurves[selectedBezierCurve].ControlPoint1X,
                    ControlPoint1Y: allBezierCurves[selectedBezierCurve].ControlPoint1Y,
                    ControlPoint2X: allBezierCurves[selectedBezierCurve].ControlPoint2X,
                    ControlPoint2Y: allBezierCurves[selectedBezierCurve].ControlPoint2Y,
                    EndX: allBezierCurves[selectedBezierCurve].EndX,
                    EndY: allBezierCurves[selectedBezierCurve].EndY, Editing: -1
                });
                selectedBezierCurveColor.push({ Idx: allBezierCurves.length - 1, Color: selectedBezierCurveColor[selectedBezierCurve].Color });
            }
        });
    AddButton(1085, 5, 50, 50, './Images/Curve.png', './Images/CurvePressed.png', './Images/CurveMouseOver.png', 'UnSelected', 'Curve');
    AddButton(1145, 5, 50, 50, './Images/Recorder.png', './Images/RecorderPressed.png', './Images/RecorderMouseOver.png', 'UnSelected', 'Recorder',
        function () {
            if (!isRecording) {
                isRecording = true;
                var recordingStream = drawingCanvas.captureStream(25);
                mediaRecorder = new MediaRecorder(recordingStream);
                mediaRecorder.start();
            } else {
                isRecording = false;
                mediaRecorder.ondataavailable = function(e) {
                    var a = document.createElement('a');
                    a.download = ['video_', (new Date() + '').slice(4, 28), '.webm'].join('');
                    a.href = URL.createObjectURL(e.data);
                    a.textContent = a.download;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    }, 0);
                };
                mediaRecorder.stop();
            }
        });
    AddButton(1205, 5, 50, 50, './Images/BezierCurve.png', './Images/BezierCurvePressed.png',
        './Images/BezierCurveMouseOver.png', 'UnSelected', 'BezierCurve');
}

function GetTotalElementOffsetLeft(e) {
    var rect = e.getBoundingClientRect();
    return rect.left;
}

function GetTotalElementOffsetTop(e) {
    var rect = e.getBoundingClientRect();
    return rect.top;
}

function drawingCanvasOnMouseDown(e) {
    if (e.button === 0) {
        var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
        var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
        leftMouseButtonDown = true;
        if (actionType === 'Pencil' || actionType === 'Line' || actionType === 'VerticalLine' ||
            actionType === 'HorizontalLine' || actionType === 'Rectangle') {
            currentSetOfPoints = new Array();
            var tmp = { 'x': pos_left, 'y': pos_top };
            currentSetOfPoints.push(tmp);
            allSetsOfPoints.push(currentSetOfPoints);
            selectedSetOfPointsColor.push({ Idx: allSetsOfPoints.length - 1, Color: currentSelectedColor });
        } else if (actionType === 'Move') {
            if (Select(pos_left, pos_top)) {
                moveSetOfPointsIndex = selectedSetOfPointsIndex;
                FreeAllReferences();
                lastMoveSetOfPointsX = pos_left;
                lastMoveSetOfPointsY = pos_top;
                Draw();
            } else if (SelectEllipse(pos_left, pos_top)) {
                moveEllipseIndex = selectedEllipse;
                FreeAllReferences();
                lastMoveEllipseX = pos_left;
                lastMoveEllipseY = pos_top;
                Draw();
            } else if (SelectText(pos_left, pos_top)) {
                moveTextIndex = selectedText;
                FreeAllReferences();
                lastMoveTextX = pos_left;
                lastMoveTextY = pos_top;
                Draw();
            } else if (SelectQuadraticCurve(pos_left, pos_top)) {
                moveCurveIndex = selectedCurve;
                FreeAllReferences();
                lastMoveCurveX = pos_left;
                lastMoveCurveY = pos_top;
                Draw();
            } else if (SelectBezierCurve(pos_left, pos_top)) {
                moveBezierCurveIndex = selectedBezierCurve;
                FreeAllReferences();
                lastMoveBezierCurveX = pos_left;
                lastMoveBezierCurveY = pos_top;
                Draw();
            }
        } else if (actionType === 'Rotation' && selectedSetOfPointsIndex > -1) {
            tmpCenter = CalculateCenterOfGravityXY(allSetsOfPoints[selectedSetOfPointsIndex]);
            tmpRotatedPoints = new Array();
            for (var i = 0; i < allSetsOfPoints[selectedSetOfPointsIndex].length; i++) {
                tmpRotatedPoints.push({ x: allSetsOfPoints[selectedSetOfPointsIndex][i].x - tmpCenter.X, y: allSetsOfPoints[selectedSetOfPointsIndex][i].y - tmpCenter.Y });
            }
        } else if (actionType === 'Ellipse') {
            currentEllipse = { TopLeftX: pos_left, TopLeftY: pos_top, Angle: 0, StartAngle: 0, EndAngle: 2 * Math.PI };
        } else if (actionType === 'Curve') {
            if (currentCurve) {
                currentCurve.Editing = -1;
            }
            currentCurve = {
                StartX: pos_left, StartY: pos_top, ControlPointX: pos_left + 50, ControlPointY: pos_top - 50,
                EndX: pos_left + 100, EndY: pos_top, Editing: -1
            };
            allCurves.push(currentCurve);
            selectedCurveColor.push({ Idx: allCurves.length - 1, Color: currentSelectedColor });
            Draw();
        } else if (actionType === 'BezierCurve') {
            if (currentBezierCurve) {
                currentBezierCurve.Editing = -1;
            }
            currentBezierCurve = {
                StartX: pos_left, StartY: pos_top, ControlPoint1X: pos_left,
                ControlPoint1Y: pos_top - 50, ControlPoint2X: pos_left + 100,
                ControlPoint2Y: pos_top - 50, EndX: pos_left + 100,
                EndY: pos_top, Editing: -1
            };
            allBezierCurves.push(currentBezierCurve);
            selectedBezierCurveColor.push({ Idx: allBezierCurves.length - 1, Color: currentSelectedColor });
            Draw();
        }
    } else if (e.button === 2) {
        var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
        var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
        rightMouseButtonDown = true;
        if (actionType === 'Curve' && currentCurve) {
            if (TestApproximateHitOfPointOnPoint(pos_left, pos_top, currentCurve.StartX, currentCurve.StartY)) {
                currentCurve.Editing = 0;
            } else if (TestApproximateHitOfPointOnPoint(pos_left, pos_top, currentCurve.ControlPointX, currentCurve.ControlPointY)) {
                currentCurve.Editing = 1;
            } else if (TestApproximateHitOfPointOnPoint(pos_left, pos_top, currentCurve.EndX, currentCurve.EndY)) {
                currentCurve.Editing = 2;
            } else {
                currentCurve.Editing = -1;
            }
        } else if (actionType === 'BezierCurve' && currentBezierCurve) {
            if (TestApproximateHitOfPointOnPoint(pos_left, pos_top, currentBezierCurve.StartX,
                currentBezierCurve.StartY)) {
                currentBezierCurve.Editing = 0;
            } else if (TestApproximateHitOfPointOnPoint(pos_left, pos_top,
                currentBezierCurve.ControlPoint1X, currentBezierCurve.ControlPoint1Y)) {
                currentBezierCurve.Editing = 1;
            } else if (TestApproximateHitOfPointOnPoint(pos_left, pos_top,
                currentBezierCurve.ControlPoint2X, currentBezierCurve.ControlPoint2Y)) {
                currentBezierCurve.Editing = 2;
            } else if (TestApproximateHitOfPointOnPoint(pos_left, pos_top,
                currentBezierCurve.EndX, currentBezierCurve.EndY)) {
                currentBezierCurve.Editing = 3;
            } else {
                currentBezierCurve.Editing = -1;
            }
        }
    }
}

function TestApproximateHitOfPointOnPoint(x1, y1, x2, y2) {
    if (Math.abs(x1 - x2) <= 5 && Math.abs(y1 - y2) <= 5) {
        return true;
    }
    return false;
}

function buttonCanvasOnMouseDown(e) {
    if (e.button === 0) {
        var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
        var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
        buttonCanvasLeftMouseButtonDown = true;
    }
}

function propertiesCanvasOnMouseDown(e) {
    if (e.button === 0) {
        var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
        var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
        propertiesCanvasLeftMouseButtonDown = true;
    }
}

function drawingCanvasOnMouseMove(e) {
    var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
    var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
    if (leftMouseButtonDown && !drawingCanvasLostFocus && currentSetOfPoints && currentSetOfPoints.length > 0) {
        if (actionType === 'Pencil' || (actionType === 'Line' && currentSetOfPoints.length === 1)) {
            var tmp = { 'x': pos_left, 'y': pos_top };
            currentSetOfPoints.push(tmp);
            Draw();
        } else if (actionType === 'Line' && currentSetOfPoints.length === 2) {
            currentSetOfPoints[1].x = pos_left;
            currentSetOfPoints[1].y = pos_top;
            Draw();
        } else if (actionType === 'VerticalLine' && currentSetOfPoints.length === 1) {
            var tmp2 = { 'x': currentSetOfPoints[0].x, 'y': pos_top };
            currentSetOfPoints.push(tmp2);
            Draw();
        } else if (actionType === 'VerticalLine' && currentSetOfPoints.length === 2) {
            currentSetOfPoints[1].y = pos_top;
            Draw();
        } else if (actionType === 'HorizontalLine' && currentSetOfPoints.length === 1) {
            var tmp3 = { 'x': pos_left, 'y': currentSetOfPoints[0].y };
            currentSetOfPoints.push(tmp3);
            Draw();
        } else if (actionType === 'HorizontalLine' && currentSetOfPoints.length === 2) {
            currentSetOfPoints[1].x = pos_left;
            Draw();
        } else if (actionType === 'Rectangle' && currentSetOfPoints.length === 1) {
            currentSetOfPoints.push({ 'x': pos_left, 'y': currentSetOfPoints[0].y });
            currentSetOfPoints.push({ 'x': pos_left, 'y': pos_top });
            currentSetOfPoints.push({ 'x': currentSetOfPoints[0].x, 'y': pos_top });
            currentSetOfPoints.push({ 'x': currentSetOfPoints[0].x, 'y': currentSetOfPoints[0].y });
            Draw();
        } else if (actionType === 'Rectangle' && currentSetOfPoints.length === 5) {
            currentSetOfPoints[1].x = pos_left;
            currentSetOfPoints[1].y = currentSetOfPoints[0].y;
            currentSetOfPoints[2].x = pos_left;
            currentSetOfPoints[2].y = pos_top;
            currentSetOfPoints[3].x = currentSetOfPoints[0].x;
            currentSetOfPoints[3].y = pos_top;
            currentSetOfPoints[4].x = currentSetOfPoints[0].x;
            currentSetOfPoints[4].y = currentSetOfPoints[0].y;
            Draw();
        }
    }
    if (leftMouseButtonDown && !drawingCanvasLostFocus && actionType === 'Move') {
        if (moveSetOfPointsIndex > -1) {
            var offsetX = pos_left - lastMoveSetOfPointsX;
            var offsetY = pos_top - lastMoveSetOfPointsY;
            lastMoveSetOfPointsX = pos_left;
            lastMoveSetOfPointsY = pos_top;
            for (var i = 0; i < allSetsOfPoints[moveSetOfPointsIndex].length; i++) {
                allSetsOfPoints[moveSetOfPointsIndex][i].x += offsetX;
                allSetsOfPoints[moveSetOfPointsIndex][i].y += offsetY;
            }
            Draw();
        } else if (moveEllipseIndex > -1) {
            var offsetX = pos_left - lastMoveEllipseX;
            var offsetY = pos_top - lastMoveEllipseY;
            lastMoveEllipseX = pos_left;
            lastMoveEllipseY = pos_top;
            allEllipses[moveEllipseIndex].TopLeftX += offsetX;
            allEllipses[moveEllipseIndex].TopLeftY += offsetY;
            allEllipses[moveEllipseIndex].BottomRightX += offsetX;
            allEllipses[moveEllipseIndex].BottomRightY += offsetY;
            allEllipses[moveEllipseIndex].CenterX += offsetX;
            allEllipses[moveEllipseIndex].CenterY += offsetY;
            Draw();
        } else if (moveTextIndex > -1) {
            var offsetX = pos_left - lastMoveTextX;
            var offsetY = pos_top - lastMoveTextY;
            lastMoveTextX = pos_left;
            lastMoveTextY = pos_top;
            allText[moveTextIndex].X += offsetX;
            allText[moveTextIndex].Y += offsetY;
            Draw();
        } else if (moveCurveIndex > -1) {
            var offsetX = pos_left - lastMoveCurveX;
            var offsetY = pos_top - lastMoveCurveY;
            lastMoveCurveX = pos_left;
            lastMoveCurveY = pos_top;
            allCurves[moveCurveIndex].StartX += offsetX;
            allCurves[moveCurveIndex].StartY += offsetY;
            allCurves[moveCurveIndex].ControlPointX += offsetX;
            allCurves[moveCurveIndex].ControlPointY += offsetY;
            allCurves[moveCurveIndex].EndX += offsetX;
            allCurves[moveCurveIndex].EndY += offsetY;
            Draw();
        } else if (moveBezierCurveIndex > -1) {
            var offsetX = pos_left - lastMoveBezierCurveX;
            var offsetY = pos_top - lastMoveBezierCurveY;
            lastMoveBezierCurveX = pos_left;
            lastMoveBezierCurveY = pos_top;
            allBezierCurves[moveBezierCurveIndex].StartX += offsetX;
            allBezierCurves[moveBezierCurveIndex].StartY += offsetY;
            allBezierCurves[moveBezierCurveIndex].ControlPoint1X += offsetX;
            allBezierCurves[moveBezierCurveIndex].ControlPoint1Y += offsetY;
            allBezierCurves[moveBezierCurveIndex].ControlPoint2X += offsetX;
            allBezierCurves[moveBezierCurveIndex].ControlPoint2Y += offsetY;
            allBezierCurves[moveBezierCurveIndex].EndX += offsetX;
            allBezierCurves[moveBezierCurveIndex].EndY += offsetY;
            Draw();
        }
    }
    if (leftMouseButtonDown && !drawingCanvasLostFocus && actionType === 'Rotation') {
        if (selectedSetOfPointsIndex > -1) {
            var tmpX = pos_left - tmpCenter.X;
            var tmpY = pos_top - tmpCenter.Y;
            var sintheta = tmpY / Math.sqrt(tmpX * tmpX + tmpY * tmpY);
            var costheta = tmpX / Math.sqrt(tmpX * tmpX + tmpY * tmpY);
            for (var j = 0; j < tmpRotatedPoints.length; j++) {
                allSetsOfPoints[selectedSetOfPointsIndex][j].x = Math.round(tmpRotatedPoints[j].x * costheta - tmpRotatedPoints[j].y * sintheta + tmpCenter.X);
                allSetsOfPoints[selectedSetOfPointsIndex][j].y = Math.round(tmpRotatedPoints[j].y * costheta + tmpRotatedPoints[j].x * sintheta + tmpCenter.Y);
            }
            Draw();
        } else if (selectedEllipse > -1) {
            var centerX = (allEllipses[selectedEllipse].TopLeftX + allEllipses[selectedEllipse].BottomRightX) / 2;
            var centerY = (allEllipses[selectedEllipse].TopLeftY + allEllipses[selectedEllipse].BottomRightY) / 2;
            var tmpX2 = pos_left - centerX;
            var tmpY2 = pos_top - centerY;
            allEllipses[selectedEllipse].Angle = Math.asin(tmpY2 / Math.sqrt(tmpX2 * tmpX2 + tmpY2 * tmpY2));
            Draw();
        } else if (selectedText > -1) {
            var tmpX2 = pos_left - (allText[selectedText].X + allText[selectedText].Width / 2);
            var tmpY2 = pos_top - (allText[selectedText].Y + allText[selectedText].FontSize / 2);
            allText[selectedText].Angle = Math.asin(tmpY2 / Math.sqrt(tmpX2 * tmpX2 + tmpY2 * tmpY2));
            Draw();
        } else if (selectedCurve > -1) {
            var tmpCenterX = (allCurves[selectedCurve].StartX + allCurves[selectedCurve].EndX) / 2;
            var tmpCenterY = (allCurves[selectedCurve].StartY + allCurves[selectedCurve].EndY) / 2;
            var tmpX2 = pos_left - tmpCenterX;
            var tmpY2 = pos_top - tmpCenterY;
            allCurves[selectedCurve].Angle = Math.asin(tmpY2 / Math.sqrt(tmpX2 * tmpX2 + tmpY2 * tmpY2));
            var sintheta2 = tmpY2 / Math.sqrt(tmpX2 * tmpX2 + tmpY2 * tmpY2);
            var costheta2 = tmpX2 / Math.sqrt(tmpX2 * tmpX2 + tmpY2 * tmpY2);
            var startX = allCurves[selectedCurve].StartX - tmpCenterX;
            var startY = allCurves[selectedCurve].StartY - tmpCenterY;
            var controlPointX = allCurves[selectedCurve].ControlPointX - tmpCenterX;
            var controlPointY = allCurves[selectedCurve].ControlPointY - tmpCenterY;
            var endX = allCurves[selectedCurve].EndX - tmpCenterX;
            var endY = allCurves[selectedCurve].EndY - tmpCenterY;
            if (!(startX === 0 && startY === 0)) {
                allCurves[selectedCurve].StartX = Math.round(startX * costheta2 - startY * sintheta2 + tmpCenterX);
                allCurves[selectedCurve].StartY = Math.round(startY * costheta2 + startX * sintheta2 + tmpCenterY);
            } else {
                allCurves[selectedCurve].StartX += tmpCenterX;
                allCurves[selectedCurve].StartY += tmpCenterY;
            }
            if (!(controlPointX === 0 && controlPointY === 0)) {
                allCurves[selectedCurve].ControlPointX = Math.round(controlPointX * costheta2 - controlPointY * sintheta2 + tmpCenterX);
                allCurves[selectedCurve].ControlPointY = Math.round(controlPointY * costheta2 + controlPointX * sintheta2 + tmpCenterY);
            } else {
                allCurves[selectedCurve].ControlPointX += tmpCenterX;
                allCurves[selectedCurve].ControlPointY += tmpCenterY;
            }
            if (!(endX === 0 && endY === 0)) {
                allCurves[selectedCurve].EndX = Math.round(endX * costheta2 - endY * sintheta2 + tmpCenterX);
                allCurves[selectedCurve].EndY = Math.round(endY * costheta2 + endX * sintheta2 + tmpCenterY);
            } else {
                allCurves[selectedCurve].EndX += tmpCenterX;
                allCurves[selectedCurve].EndY += tmpCenterY;
            }
            Draw();
        } else if (selectedBezierCurve > -1) {
            var tmpCenterX = (allBezierCurves[selectedBezierCurve].StartX +
                allBezierCurves[selectedBezierCurve].EndX) / 2;
            var tmpCenterY = (allBezierCurves[selectedBezierCurve].StartY +
                allBezierCurves[selectedBezierCurve].EndY) / 2;
            var tmpX2 = pos_left - tmpCenterX;
            var tmpY2 = pos_top - tmpCenterY;
            allBezierCurves[selectedBezierCurve].Angle = Math.asin(tmpY2 /
                Math.sqrt(tmpX2 * tmpX2 + tmpY2 * tmpY2));
            var sintheta2 = tmpY2 / Math.sqrt(tmpX2 * tmpX2 + tmpY2 * tmpY2);
            var costheta2 = tmpX2 / Math.sqrt(tmpX2 * tmpX2 + tmpY2 * tmpY2);
            var startX = allBezierCurves[selectedBezierCurve].StartX - tmpCenterX;
            var startY = allBezierCurves[selectedBezierCurve].StartY - tmpCenterY;
            var controlPoint1X = allBezierCurves[selectedBezierCurve].ControlPoint1X - tmpCenterX;
            var controlPoint1Y = allBezierCurves[selectedBezierCurve].ControlPoint1Y - tmpCenterY;
            var controlPoint2X = allBezierCurves[selectedBezierCurve].ControlPoint2X - tmpCenterX;
            var controlPoint2Y = allBezierCurves[selectedBezierCurve].ControlPoint2Y - tmpCenterY;
            var endX = allBezierCurves[selectedBezierCurve].EndX - tmpCenterX;
            var endY = allBezierCurves[selectedBezierCurve].EndY - tmpCenterY;
            if (!(startX === 0 && startY === 0)) {
                allBezierCurves[selectedBezierCurve].StartX =
                    Math.round(startX * costheta2 - startY * sintheta2 + tmpCenterX);
                allBezierCurves[selectedBezierCurve].StartY =
                    Math.round(startY * costheta2 + startX * sintheta2 + tmpCenterY);
            } else {
                allBezierCurves[selectedBezierCurve].StartX += tmpCenterX;
                allBezierCurves[selectedBezierCurve].StartY += tmpCenterY;
            }
            if (!(controlPoint1X === 0 && controlPoint1Y === 0)) {
                allBezierCurves[selectedBezierCurve].ControlPoint1X =
                    Math.round(controlPoint1X * costheta2 - controlPoint1Y * sintheta2 + tmpCenterX);
                allBezierCurves[selectedBezierCurve].ControlPoint1Y =
                    Math.round(controlPoint1Y * costheta2 + controlPoint1X * sintheta2 + tmpCenterY);
            } else {
                allBezierCurves[selectedBezierCurve].ControlPoint1X += tmpCenterX;
                allBezierCurves[selectedBezierCurve].ControlPoint1Y += tmpCenterY;
            }
            if (!(controlPoint2X === 0 && controlPoint2Y === 0)) {
                allBezierCurves[selectedBezierCurve].ControlPoint2X =
                    Math.round(controlPoint2X * costheta2 - controlPoint2Y * sintheta2 + tmpCenterX);
                allBezierCurves[selectedBezierCurve].ControlPoint2Y =
                    Math.round(controlPoint2Y * costheta2 + controlPoint2X * sintheta2 + tmpCenterY);
            } else {
                allBezierCurves[selectedBezierCurve].ControlPoint2X += tmpCenterX;
                allBezierCurves[selectedBezierCurve].ControlPoint2Y += tmpCenterY;
            }
            if (!(endX === 0 && endY === 0)) {
                allBezierCurves[selectedBezierCurve].EndX =
                    Math.round(endX * costheta2 - endY * sintheta2 + tmpCenterX);
                allBezierCurves[selectedBezierCurve].EndY =
                    Math.round(endY * costheta2 + endX * sintheta2 + tmpCenterY);
            } else {
                allBezierCurves[selectedBezierCurve].EndX += tmpCenterX;
                allBezierCurves[selectedBezierCurve].EndY += tmpCenterY;
            }
            Draw();
        }
    }
    if (leftMouseButtonDown && !drawingCanvasLostFocus && actionType === 'Ellipse' && currentEllipse) {
        currentEllipse.BottomRightX = pos_left;
        currentEllipse.BottomRightY = pos_top;
        currentEllipse.SemiMajorAxisLength = Math.abs(currentEllipse.TopLeftX - currentEllipse.BottomRightX) / 2;
        currentEllipse.SemiMinorAxisLength = Math.abs(currentEllipse.TopLeftY - currentEllipse.BottomRightY) / 2;
        currentEllipse.CenterX = currentEllipse.TopLeftX + (currentEllipse.BottomRightX - currentEllipse.TopLeftX) / 2;
        currentEllipse.CenterY = currentEllipse.TopLeftY + (currentEllipse.BottomRightY - currentEllipse.TopLeftY) / 2;
        Draw();
    }
    if (rightMouseButtonDown && !drawingCanvasLostFocus && actionType === 'Curve' && currentCurve) {
        if (currentCurve.Editing === 0) {
            currentCurve.StartX = pos_left;
            currentCurve.StartY = pos_top;
            Draw();
        } else if (currentCurve.Editing === 1) {
            currentCurve.ControlPointX = pos_left;
            currentCurve.ControlPointY = pos_top;
            Draw();
        } else if (currentCurve.Editing === 2) {
            currentCurve.EndX = pos_left;
            currentCurve.EndY = pos_top;
            Draw();
        }
    }
    if (rightMouseButtonDown && !drawingCanvasLostFocus && actionType === 'BezierCurve' &&
        currentBezierCurve) {
        if (currentBezierCurve.Editing === 0) {
            currentBezierCurve.StartX = pos_left;
            currentBezierCurve.StartY = pos_top;
            Draw();
        } else if (currentBezierCurve.Editing === 1) {
            currentBezierCurve.ControlPoint1X = pos_left;
            currentBezierCurve.ControlPoint1Y = pos_top;
            Draw();
        } else if (currentBezierCurve.Editing === 2) {
            currentBezierCurve.ControlPoint2X = pos_left;
            currentBezierCurve.ControlPoint2Y = pos_top;
            Draw();
        } else if (currentBezierCurve.Editing === 3) {
            currentBezierCurve.EndX = pos_left;
            currentBezierCurve.EndY = pos_top;
            Draw();
        }
    }
}

function buttonCanvasOnMouseMove(e) {
    var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
    var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].State !== 'Selected') {
            if (pos_left >= buttons[i].X && pos_left < buttons[i].X + buttons[i].Width && pos_top >= buttons[i].Y &&
                pos_top <= buttons[i].Y + buttons[i].Height) {
                buttons[i].State = 'MouseOver';
            } else {
                buttons[i].State = 'UnSelected';
            }
            Draw();
        }
    }
}

function drawingCanvasOnMouseUp(e) {
    var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
    var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
    if (e.button === 0 && leftMouseButtonDown) {
        leftMouseButtonDown = false;
        if (actionType === 'Pencil') {
            var tmp = { 'x': pos_left, 'y': pos_top };
            if (currentSetOfPoints.length > 0) {
                currentSetOfPoints.push(tmp);
                Draw();
            }
            currentSetOfPoints = null;
        } else if (actionType === 'Line' || actionType === 'VerticalLine' || actionType === 'HorizontalLine' || actionType === 'Rectangle') {
            var tmp1;
            if (actionType === 'Rectangle') {
                if (currentSetOfPoints.length === 1) {
                    currentSetOfPoints.push({ 'x': pos_left, 'y': currentSetOfPoints[0].y });
                    currentSetOfPoints.push({ 'x': pos_left, 'y': pos_top });
                    currentSetOfPoints.push({ 'x': currentSetOfPoints[0].x, 'y': pos_top });
                    currentSetOfPoints.push({ 'x': currentSetOfPoints[0].x, 'y': currentSetOfPoints[0].y });
                    currentSetOfPoints = null;
                    Draw();
                } else if (currentSetOfPoints.length === 5) {
                    currentSetOfPoints[1].x = pos_left;
                    currentSetOfPoints[1].y = currentSetOfPoints[0].y;
                    currentSetOfPoints[2].x = pos_left;
                    currentSetOfPoints[2].y = pos_top;
                    currentSetOfPoints[3].x = currentSetOfPoints[0].x;
                    currentSetOfPoints[3].y = pos_top;
                    currentSetOfPoints[4].x = currentSetOfPoints[0].x;
                    currentSetOfPoints[4].y = currentSetOfPoints[0].y;
                    currentSetOfPoints = null;
                    Draw();
                }
            } else if (currentSetOfPoints.length === 1) {
                if (actionType === 'Line') {
                    tmp1 = { 'x': pos_left, 'y': pos_top };
                    currentSetOfPoints.push(tmp1);
                    currentSetOfPoints = null;
                    Draw();
                } else if (actionType === 'VerticalLine') {
                    tmp1 = { 'x': currentSetOfPoints[0].x, 'y': pos_top };
                    currentSetOfPoints.push(tmp1);
                    currentSetOfPoints = null;
                    Draw();
                } else if (actionType === 'HorizontalLine') {
                    tmp1 = { 'x': pos_left, 'y': currentSetOfPoints[0].y };
                    currentSetOfPoints.push(tmp1);
                    currentSetOfPoints = null;
                    Draw();
                }
            } else if (currentSetOfPoints.length === 2) {
                if (actionType === 'Line') {
                    currentSetOfPoints[1].x = pos_left;
                    currentSetOfPoints[1].y = pos_top;
                    currentSetOfPoints = null;
                    Draw();
                } else if (actionType === 'VerticalLine') {
                    currentSetOfPoints[1].y = pos_top;
                    currentSetOfPoints = null;
                    Draw();
                } else if (actionType === 'HorizontalLine') {
                    currentSetOfPoints[1].x = pos_left;
                    currentSetOfPoints = null;
                    Draw();
                }
            }
        } else if (actionType === 'Select') {
            if (Select(pos_left, pos_top)) {
                Draw();
            } else if (SelectEllipse(pos_left, pos_top)) {
                Draw();
            } else if (SelectText(pos_left, pos_top)) {
                Draw();
            } else if (SelectQuadraticCurve(pos_left, pos_top)) {
                Draw();
            } else if (SelectBezierCurve(pos_left, pos_top)) {
                Draw();
            }
        } else if (actionType === 'Move') {
            moveSetOfPointsIndex = -1;
            moveEllipseIndex = -1;
            moveTextIndex = -1;
            moveCurveIndex = -1;
            moveBezierCurveIndex = -1;
            Draw();
        } else if (actionType === 'Ellipse' && currentEllipse) {
            currentEllipse.BottomRightX = pos_left;
            currentEllipse.BottomRightY = pos_top;
            currentEllipse.SemiMajorAxisLength = Math.abs(currentEllipse.TopLeftX - currentEllipse.BottomRightX) / 2;
            currentEllipse.SemiMinorAxisLength = Math.abs(currentEllipse.TopLeftY - currentEllipse.BottomRightY) / 2;
            currentEllipse.CenterX = currentEllipse.TopLeftX + (currentEllipse.BottomRightX - currentEllipse.TopLeftX) / 2;
            currentEllipse.CenterY = currentEllipse.TopLeftY + (currentEllipse.BottomRightY - currentEllipse.TopLeftY) / 2;
            allEllipses.push(currentEllipse);
            selectedEllipseColor.push({ Idx: allEllipses.length - 1, Color: currentSelectedColor });
            currentEllipse = null;
            Draw();
        } else if (actionType === 'Text') {
            currentText = { X: pos_left, Y: pos_top, Value: '', FontSize: 12, FontName: 'Tahoma', Angle: 0 };
            allText.push(currentText);
            selectedTextColor.push({ Idx: allText.length - 1, Color: currentSelectedColor });
        }
    } else if (e.button === 2 && rightMouseButtonDown) {
        rightMouseButtonDown = false;
        if (actionType === 'Curve' && currentCurve) {
            if (currentCurve.Editing === 0) {
                currentCurve.StartX = pos_left;
                currentCurve.StartY = pos_top;
            } else if (currentCurve.Editing === 1) {
                currentCurve.ControlPointX = pos_left;
                currentCurve.ControlPointY = pos_top;
            } else if (currentCurve.Editing === 2) {
                currentCurve.EndX = pos_left;
                currentCurve.EndY = pos_top;
            }
            Draw();
        } else if (actionType === 'BezierCurve' && currentBezierCurve) {
            if (currentBezierCurve.Editing === 0) {
                currentBezierCurve.StartX = pos_left;
                currentBezierCurve.StartY = pos_top;
            } else if (currentBezierCurve.Editing === 1) {
                currentBezierCurve.ControlPoint1X = pos_left;
                currentBezierCurve.ControlPoint1Y = pos_top;
            } else if (currentBezierCurve.Editing === 2) {
                currentBezierCurve.ControlPoint2X = pos_left;
                currentBezierCurve.ControlPoint2Y = pos_top;
            } else if (currentBezierCurve.Editing === 3) {
                currentBezierCurve.EndX = pos_left;
                currentBezierCurve.EndY = pos_top;
            }
            Draw();
        }
    }
}

function buttonCanvasOnMouseUp(e) {
    var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
    var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
    if (e.button === 0 && buttonCanvasLeftMouseButtonDown) {
        buttonCanvasLeftMouseButtonDown = false;
        for (var i = 0; i < buttons.length; i++) {
            if (pos_left >= buttons[i].X && pos_left < buttons[i].X + buttons[i].Width && pos_top >= buttons[i].Y &&
                pos_top <= buttons[i].Y + buttons[i].Height) {
                if (actionType !== buttons[i].ActionType) {
                    if (buttons[i].ActionType !== 'Curve') {
                        currentCurve = null;
                    }
                    if (buttons[i].ActionType !== 'BezierCurve') {
                        currentBezierCurve = null;
                    }
                    if (!buttons[i].OnClick) {
                        buttons[i].State = 'Selected';
                        actionType = buttons[i].ActionType;
                        for (var p = 0; p < buttons.length; p++) {
                            if (p !== i) {
                                buttons[p].State = 'UnSelected';
                            }
                        }
                    } else {
                        buttons[i].OnClick();
                    }
                    if (actionType === 'Pencil' || actionType === 'Text' || actionType === 'Rectangle' ||
                        actionType === 'Ellipse' || actionType === 'Line' || actionType === 'Select' ||
                        actionType === 'HorizontalLine' || actionType === 'VerticalLine' || actionType == 'Curve' || actionType === 'BezierCurve') {
                        FreeAllReferences();
                    }
                    currentText = null;
                    Draw();
                }
            }
        }
    }
}

function propertiesCanvasOnMouseUp(e) {
    if (e.button === 0 && actionType === 'ColorPicker' && propertiesCanvasLeftMouseButtonDown) {
        propertiesCanvasLeftMouseButtonDown = false;
        var pos_left = e.pageX - GetTotalElementOffsetLeft(e.currentTarget);
        var pos_top = e.pageY - GetTotalElementOffsetTop(e.currentTarget);
        if (actionType === 'ColorPicker') {
            if (pos_left <= propertiesCanvas.width && pos_left >= 20 && pos_top <= propertiesCanvas.height && pos_top >= 20) {
                var d = propertiesCanvasCtx.getImageData(pos_left, pos_top, 1, 1).data;
                currentSelectedColor = "#" + ("000000" + rgbToHex(d[0], d[1], d[2])).slice(-6);
                Draw();
            }
        }
    }
}

function drawingCanvasOnKeyPress(e) {
    if (actionType === 'Text' && currentText) {
        currentText.Value += e.key;
        drawingCanvasCtx.fontStyle = currentText.FontSize + 'px ' + currentText.FontName;
        var mt = drawingCanvasCtx.measureText(currentText.Value);
        currentText.Width = mt.width;
        Draw();
    }
}

function drawingCanvasOnKeyUp(e) {
    if (actionType === 'Text' && currentText && currentText.Value && currentText.Value.length > 0) {
        if (e.keyCode === 8) {
            currentText.Value = currentText.Value.substring(0, currentText.Value.length - 1);
            drawingCanvasCtx.fontStyle = currentText.FontSize + 'px ' + currentText.FontName;
            var mt = drawingCanvasCtx.measureText(currentText.Value);
            currentText.Width = mt.width;
            Draw();
        }
    }
}

function drawingCanvasOnMouseEnter(e) {
    drawingCanvasLostFocus = false;
}

function drawingCanvasOnMouseLeave(e) {
    leftMouseButtonDown = false;
    drawingCanvasLostFocus = true;
    Draw();
}

function buttonCanvasOnMouseLeave() {
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].State !== 'Selected') {
            buttons[i].State = 'UnSelected';
        }
    }
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function CheckApproximateBoxPointIntersectLine(z, j, e) {
    var x = (e.y - allSetsOfPoints[z][j].y) * (allSetsOfPoints[z][j].x - allSetsOfPoints[z][j + 1].x) /
        (allSetsOfPoints[z][j].y - allSetsOfPoints[z][j + 1].y) + allSetsOfPoints[z][j].x;
    if (((x >= allSetsOfPoints[z][j].x && x <= allSetsOfPoints[z][j + 1].x) || (x >= allSetsOfPoints[z][j + 1].x && x <= allSetsOfPoints[z][j].x)) &&
        ((e.y >= allSetsOfPoints[z][j].y && e.y <= allSetsOfPoints[z][j + 1].y) || (e.y >= allSetsOfPoints[z][j + 1].y && e.y <= allSetsOfPoints[z][j].y))) {
        if (Math.abs(e.x - x) <= 3) {
            return true;
        }
    }
    var y1 = (e.x - allSetsOfPoints[z][j].x) * (allSetsOfPoints[z][j].y - allSetsOfPoints[z][j + 1].y) /
        (allSetsOfPoints[z][j].x - allSetsOfPoints[z][j + 1].x) + allSetsOfPoints[z][j].y;
    if (((e.x >= allSetsOfPoints[z][j].x && e.x <= allSetsOfPoints[z][j + 1].x) || (e.x >= allSetsOfPoints[z][j + 1].x && e.x <= allSetsOfPoints[z][j].x)) &&
        ((y1 >= allSetsOfPoints[z][j].y && y1 <= allSetsOfPoints[z][j + 1].y) || (y1 >= allSetsOfPoints[z][j + 1].y && y1 <= allSetsOfPoints[z][j].y))) {
        if (Math.abs(e.y - y1) <= 3) {
            return true;
        }
    }
    return false;
}

function Select(pos_left, pos_top) {
    for (var k = 0; k < allSetsOfPoints.length; k++) {
        for (var j = 0; j < allSetsOfPoints[k].length - 1; j++) {
            if (CheckApproximateBoxPointIntersectLine(k, j, { x: pos_left, y: pos_top })) {
                if (selectedSetOfPointsIndex === k) {
                    FreeAllReferences();
                } else {
                    FreeAllReferences();
                    selectedSetOfPointsIndex = k;
                }
                originalPointsBeingScaled = new Array();
                tmpCenter = null;
                return true;
            }
        }
    }
    return false;
}

function SelectEllipse(x, y) {
    for (var i = 0; i < allEllipses.length; i++) {
        var tmpX = 0, tmpY = 0;
        tmpX = (x - allEllipses[i].CenterX);
        tmpY = (y - allEllipses[i].CenterY);
        var a = allEllipses[i].SemiMajorAxisLength;
        var b = allEllipses[i].SemiMinorAxisLength;
        if (allEllipses[i].Angle !== 0) {
            var sintheta = Math.sin(allEllipses[i].Angle);
            var costheta = Math.cos(allEllipses[i].Angle);
            var f = b * b * sintheta * sintheta + a * a * costheta * costheta;
            var g = 2 * tmpX * b * b * costheta * sintheta - 2 * tmpX * a * a * sintheta * costheta;
            var h = b * b * tmpX * tmpX * costheta * costheta + a * a * tmpX * tmpX * sintheta * sintheta
                - a * a * b * b;
            if (f === 0) {
                var yGivenX = -h / g;
                if (Math.abs(tmpY - yGivenX) <= 5) {
                    if (selectedEllipse === i) {
                        FreeAllReferences();
                    } else {
                        FreeAllReferences();
                        selectedEllipse = i;
                    }
                    return true;
                }
            } else {
                var sqrt = Math.sqrt(g * g - 4 * f * h);
                var yPositiveGivenX = (-g + sqrt) / (2 * f);
                if (Math.abs(tmpY - yPositiveGivenX) <= 5) {
                    if (selectedEllipse === i) {
                        FreeAllReferences();
                    } else {
                        FreeAllReferences();
                        selectedEllipse = i;
                    }
                    return true;
                } else {
                    var yNegativeGiveX = (-g - sqrt) / (2 * f);
                    if (Math.abs(tmpY - yNegativeGiveX) <= 5) {
                        if (selectedEllipse === i) {
                            FreeAllReferences();
                        } else {
                            FreeAllReferences();
                            selectedEllipse = i;
                        }
                        return true;
                    }
                }
            }
        } else {
            var yPositive = Math.sqrt((1 - (tmpX * tmpX) / (a * a)) * (b * b));
            if (Math.abs(tmpY - yPositive) <= 5 ||
                Math.abs(tmpY + yPositive) <= 5) {
                if (selectedEllipse === i) {
                    FreeAllReferences();
                } else {
                    FreeAllReferences();
                    selectedEllipse = i;
                }
                return true;
            }
        }
    }
    return false;
}

function SelectText(pos_left, pos_top) {
    for (var h = 0; h < allText.length; h++) {
        if (allText[h].Angle === 0) {
            if (pos_left >= allText[h].X && pos_left <= allText[h].X + allText[h].Width && pos_top >= allText[h].Y - allText[h].FontSize &&
                pos_top <= allText[h].Y) {
                if (selectedText === h) {
                    FreeAllReferences();
                } else {
                    FreeAllReferences();
                    selectedText = h;
                }
                originalPointsBeingScaled = new Array();
                tmpCenter = null;
                return true;
            }
        } else {
            var centerX = allText[h].X + allText[h].Width / 2;
            var centerY = allText[h].Y + allText[h].FontSize / 2;
            var tmpX = pos_left - centerX;
            var tmpY = pos_top - centerY;
            var sintheta = Math.sin(-allText[h].Angle);
            var costheta = Math.cos(-allText[h].Angle);
            var newTmpX = tmpX * costheta - tmpY * sintheta;
            var newTmpY = tmpY * costheta + tmpX * sintheta;
            var minX1X2 = Math.min(allText[h].X - centerX, allText[h].X + allText[h].Width - centerX);
            var maxX1X2 = Math.max(allText[h].X - centerX, allText[h].X + allText[h].Width - centerX);
            var minY1Y2 = Math.min(allText[h].Y - centerY, allText[h].Y - allText[h].FontSize - centerY);
            var maxY1Y2 = Math.max(allText[h].Y - centerY, allText[h].Y - allText[h].FontSize - centerY);
            if (minX1X2 <= newTmpX && maxX1X2 >= newTmpX && minY1Y2 <= newTmpY && maxY1Y2 >= newTmpY) {
                if (selectedText === h) {
                    FreeAllReferences();
                } else {
                    FreeAllReferences();
                    selectedText = h;
                }
                originalPointsBeingScaled = new Array();
                tmpCenter = null;
                return true;
            }
        }
    }
    return false;
}

function SelectQuadraticCurveSetSelectedIndex(i) {
    if (selectedCurve === i) {
        FreeAllReferences();
    } else {
        FreeAllReferences();
        selectedCurve = i;
    }
}

function SelectQuadraticCurve(pos_left, pos_top) {
    for (var i = 0; i < allCurves.length; i++) {
        var a = allCurves[i].StartX - 2 * allCurves[i].ControlPointX + allCurves[i].EndX;
        var k = 2 * (allCurves[i].ControlPointX - allCurves[i].StartX);
        var j = allCurves[i].StartX - pos_left;
        var o = k * k - 4 * a * j;
        if (a === 0) {
            var tSimple = -j / k;
            var ySimple = (1 - tSimple) * (1 - tSimple) * allCurves[i].StartY + 2 * (1 - tSimple) *
                tSimple * allCurves[i].ControlPointY + tSimple * tSimple * allCurves[i].EndY;
            if (Math.abs(pos_top - ySimple) <= 3) {
                SelectQuadraticCurveSetSelectedIndex(i);
                return true;
            }
        } else {
            if (o >= 0) {
                var sqrtGivenX = Math.sqrt(o);
                var tPositiveGivenX = (sqrtGivenX - k) / (2 * a);
                var yTPositiveGivenX = (1 - tPositiveGivenX) * (1 - tPositiveGivenX) * allCurves[i].StartY + 2 * (1 - tPositiveGivenX) *
                    tPositiveGivenX * allCurves[i].ControlPointY + tPositiveGivenX * tPositiveGivenX * allCurves[i].EndY;
                if (Math.abs(pos_top - yTPositiveGivenX) <= 3) {
                    SelectQuadraticCurveSetSelectedIndex(i);
                    return true;
                }
                var tNegativeGivenX = (-k - sqrtGivenX) / (2 * a);
                var yTNegativeGivenX = (1 - tNegativeGivenX) * (1 - tNegativeGivenX) * allCurves[i].StartY + 2 * (1 - tNegativeGivenX) *
                    tNegativeGivenX * allCurves[i].ControlPointY + tNegativeGivenX * tNegativeGivenX * allCurves[i].EndY;
                if (Math.abs(pos_top - yTNegativeGivenX) <= 3) {
                    SelectQuadraticCurveSetSelectedIndex(i);
                    return true;
                }
            }
            a = allCurves[i].StartY - 2 * allCurves[i].ControlPointY + allCurves[i].EndY;
            k = 2 * (allCurves[i].ControlPointY - allCurves[i].StartY);
            j = allCurves[i].StartY - pos_top;
            o = k * k - 4 * a * j;
            if (o >= 0) {
                var sqrtGivenY = Math.sqrt(o);
                var tPositiveGivenY = (sqrtGivenY - k) / (2 * a);
                var xTPositiveGivenY = (1 - tPositiveGivenY) * (1 - tPositiveGivenY) * allCurves[i].StartX + 2 * (1 - tPositiveGivenY) *
                    tPositiveGivenY * allCurves[i].ControlPointX + tPositiveGivenY * tPositiveGivenY * allCurves[i].EndX;
                if (Math.abs(pos_top - xTPositiveGivenY) <= 3) {
                    SelectQuadraticCurveSetSelectedIndex(i);
                    return true;
                }
                var tNegativeGivenY = (-k - sqrtGivenY) / (2 * a);
                var xTNegativeGivenY = (1 - tNegativeGivenY) * (1 - tNegativeGivenY) * allCurves[i].StartX + 2 * (1 - tNegativeGivenY) *
                    tNegativeGivenY * allCurves[i].ControlPointX + tNegativeGivenY * tNegativeGivenY * allCurves[i].EndX;
                if (Math.abs(pos_top - xTNegativeGivenY) <= 3) {
                    SelectQuadraticCurveSetSelectedIndex(i);
                    return true;
                }
            }
        }
    }
    return false;
}

function SelectBezierCurve(pos_left, pos_top) {
    for (var i = 0; i < allBezierCurves.length; i++) {
        if ((Math.abs(pos_left - allBezierCurves[i].StartX) < 5 &&
            Math.abs(pos_top - allBezierCurves[i].StartY) < 5) ||
            Math.abs(pos_left - allBezierCurves[i].EndX) < 5 &&
            Math.abs(pos_top - allBezierCurves[i].EndY) < 5) {
            if (selectedBezierCurve === i) {
                FreeAllReferences();
            } else {
                FreeAllReferences();
                selectedBezierCurve = i;
            }
            return true;
        } else {
            var path = new Path2D();
            drawingCanvasCtx.lineWidth = 5;
            path.moveTo(allBezierCurves[i].StartX, allBezierCurves[i].StartY);
            path.bezierCurveTo(allBezierCurves[i].ControlPoint1X, allBezierCurves[i].ControlPoint1Y,
                allBezierCurves[i].ControlPoint2X, allBezierCurves[i].ControlPoint2Y,
                allBezierCurves[i].EndX, allBezierCurves[i].EndY);
            if (drawingCanvasCtx.isPointInStroke(path, pos_left, pos_top)) {
                if (selectedBezierCurve === i) {
                    FreeAllReferences();
                } else {
                    FreeAllReferences();
                    selectedBezierCurve = i;
                }
                drawingCanvasCtx.lineWidth = 1;
                return true;
            }
            drawingCanvasCtx.lineWidth = 1;
        }
    }
    return false;
}

function GetButtonImage(k) {
    if (buttons[k].State === 'Selected' || (buttons[k].ActionType === 'Recorder' && isRecording)) {
        return buttons[k].ImgSrcPressed;
    } else if (buttons[k].State === 'MouseOver') {
        return buttons[k].ImgSrcMouseOver;
    } else {
        return buttons[k].ImgSrc;
    }
}

function Draw() {
    drawingCanvasCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawingCanvasCtx.strokeStyle = '#000000';
    drawingCanvasCtx.strokeRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    buttonCanvasCtx.clearRect(0, 0, buttonCanvas.width, buttonCanvas.height);
    buttonCanvasCtx.strokeStyle = '#000000';
    buttonCanvasCtx.strokeRect(0, 0, buttonCanvas.width, buttonCanvas.height);
    propertiesCanvasCtx.clearRect(0, 0, propertiesCanvas.width, propertiesCanvas.height);
    propertiesCanvasCtx.strokeStyle = '#000000';
    propertiesCanvasCtx.strokeRect(0, 0, propertiesCanvas.width, propertiesCanvas.height);
    for (var k = 0; k < buttons.length; k++) {
        var img = GetButtonImage(k);
        if (img !== undefined) {
            if (buttons[k].Width > 0 && buttons[k].Height > 0) {
                buttonCanvasCtx.drawImage(img, buttons[k].X, buttons[k].Y, buttons[k].Width, buttons[k].Height);
            } else {
                buttonCanvasCtx.drawImage(img, buttons[k].X, buttons[k].Y);
            }
        }
    }
    for (var i = 0; i < allSetsOfPoints.length - ((actionType === 'Line' || actionType === 'VerticalLine' || actionType === 'HorizontalLine')
        && currentSetOfPoints && currentSetOfPoints.length === 2 ? 1 : (actionType === 'Rectangle' && currentSetOfPoints &&
            currentSetOfPoints.length === 5 ? 1 : 0)); i++) {
        if (allSetsOfPoints[i].length > 1) {
            drawingCanvasCtx.beginPath();
            drawingCanvasCtx.moveTo(allSetsOfPoints[i][0].x, allSetsOfPoints[i][0].y);
            for (var j = 1; j < allSetsOfPoints[i].length; j++) {
                drawingCanvasCtx.lineTo(allSetsOfPoints[i][j].x, allSetsOfPoints[i][j].y);
            }
            if (selectedSetOfPointsIndex === i) {
                drawingCanvasCtx.setLineDash([3, 3]);
            } else if (moveSetOfPointsIndex === i) {
                drawingCanvasCtx.setLineDash([2, 2]);
            }
            var setColor = false;
            for (var r = 0; r < selectedSetOfPointsColor.length; r++) {
                if (selectedSetOfPointsColor[r].Idx === i) {
                    drawingCanvasCtx.strokeStyle = selectedSetOfPointsColor[r].Color;
                    setColor = true;
                    break;
                }
            }
            if (!setColor) {
                drawingCanvasCtx.strokeStyle = '#000000';
            }
            drawingCanvasCtx.stroke();
            if (selectedSetOfPointsIndex === i || moveSetOfPointsIndex === i) {
                drawingCanvasCtx.setLineDash([]);
            }
        }
    }
    if ((actionType === 'Line' || actionType === 'VerticalLine' || actionType === 'HorizontalLine') && currentSetOfPoints && currentSetOfPoints.length === 2) {
        drawingCanvasCtx.setLineDash([5, 5]);
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.moveTo(currentSetOfPoints[0].x, currentSetOfPoints[0].y);
        drawingCanvasCtx.lineTo(currentSetOfPoints[1].x, currentSetOfPoints[1].y);
        drawingCanvasCtx.stroke();
        drawingCanvasCtx.setLineDash([]);
    }
    if (actionType === 'Rectangle' && currentSetOfPoints && currentSetOfPoints.length === 5) {
        drawingCanvasCtx.setLineDash([5, 5]);
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.moveTo(currentSetOfPoints[0].x, currentSetOfPoints[0].y);
        for (var g = 1; g < currentSetOfPoints.length; g++) {
            drawingCanvasCtx.lineTo(currentSetOfPoints[g].x, currentSetOfPoints[g].y);
        }
        drawingCanvasCtx.stroke();
        drawingCanvasCtx.setLineDash([]);
    }
    for (var t = 0; t < allEllipses.length; t++) {
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.ellipse(allEllipses[t].CenterX, allEllipses[t].CenterY,
            allEllipses[t].SemiMajorAxisLength, allEllipses[t].SemiMinorAxisLength,
            allEllipses[t].Angle, allEllipses[t].StartAngle, allEllipses[t].EndAngle, 0);
        if (selectedEllipse === t) {
            drawingCanvasCtx.setLineDash([3, 3]);
        } else if (moveEllipseIndex === t) {
            drawingCanvasCtx.setLineDash([2, 2]);
        }
        var setColor2 = false;
        for (var q = 0; q < selectedEllipseColor.length; q++) {
            if (selectedEllipseColor[q].Idx === t) {
                drawingCanvasCtx.strokeStyle = selectedEllipseColor[q].Color;
                setColor2 = true;
                break;
            }
        }
        if (!setColor2) {
            drawingCanvasCtx.strokeStyle = '#000000';
        }
        drawingCanvasCtx.stroke();
        if (selectedEllipse === t || moveEllipseIndex == t) {
            drawingCanvasCtx.setLineDash([]);
        }
    }
    if (currentEllipse && currentEllipse.TopLeftX && currentEllipse.TopLeftY && currentEllipse.BottomRightX && currentEllipse.BottomRightY) {
        drawingCanvasCtx.strokeStyle = '#00FF00';
        drawingCanvasCtx.setLineDash([5, 5]);
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.rect(currentEllipse.TopLeftX < currentEllipse.BottomRightX ? currentEllipse.TopLeftX : currentEllipse.BottomRightX,
            currentEllipse.TopLeftY < currentEllipse.BottomRightY ? currentEllipse.TopLeftY : currentEllipse.BottomRightY,
            Math.abs(currentEllipse.TopLeftX - currentEllipse.BottomRightX), Math.abs(currentEllipse.TopLeftY - currentEllipse.BottomRightY));
        drawingCanvasCtx.stroke();
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.ellipse(currentEllipse.CenterX, currentEllipse.CenterY,
            currentEllipse.SemiMajorAxisLength, currentEllipse.SemiMinorAxisLength,
            currentEllipse.Angle, currentEllipse.StartAngle, currentEllipse.EndAngle, 0);
        drawingCanvasCtx.stroke();
        drawingCanvasCtx.setLineDash([]);
    }
    if (actionType === 'ColorPicker') {
        var gradient = propertiesCanvasCtx.createLinearGradient(0, 0, 0, propertiesCanvas.height - 40);
        gradient.addColorStop(0, "black");
        gradient.addColorStop(1 / 8, 'red');
        gradient.addColorStop(2 / 8, 'orange');
        gradient.addColorStop(3 / 8, 'yellow');
        gradient.addColorStop(4 / 8, 'green');
        gradient.addColorStop(5 / 8, 'blue');
        gradient.addColorStop(6 / 8, 'indigo');
        gradient.addColorStop(7 / 8, 'violet');
        gradient.addColorStop(1, "white");
        propertiesCanvasCtx.fillStyle = gradient;
        propertiesCanvasCtx.fillRect(20, 20, propertiesCanvas.width - 40, propertiesCanvas.height - 40);
        propertiesCanvasCtx.strokeStyle = '#000000';
        propertiesCanvasCtx.strokeRect(20, 20, propertiesCanvas.width - 40, propertiesCanvas.height - 40);
    }
    for (var d = 0; d < allText.length - (actionType === 'Text' && currentText ? 1 : 0); d++) {
        var setColor3 = false;
        for (var u = 0; u < selectedTextColor.length; u++) {
            if (selectedTextColor[u].Idx === d) {
                drawingCanvasCtx.fillStyle = selectedTextColor[u].Color;
                drawingCanvasCtx.strokeStyle = selectedTextColor[u].Color;
                setColor3 = true;
                break;
            }
        }
        if (!setColor3) {
            drawingCanvasCtx.fillStyle = '#000000';
            drawingCanvasCtx.strokeStyle = '#000000';
        }
        drawingCanvasCtx.font = allText[d].FontSize + 'px ' + allText[d].FontName;
        drawingCanvasCtx.save();
        drawingCanvasCtx.translate(allText[d].X + allText[d].Width / 2, allText[d].Y + allText[d].FontSize / 2);
        if (allText[d].Angle !== 0) {
            drawingCanvasCtx.rotate(allText[d].Angle);
        }
        if (allText[d].FlipHorizontal) {
            drawingCanvasCtx.scale(-1, 1);
        }
        if (allText[d].FlipVertical) {
            drawingCanvasCtx.scale(1, -1);
        }
        if (selectedText === d || moveTextIndex === d) {
            drawingCanvasCtx.strokeText(allText[d].Value, -allText[d].Width / 2, -allText[d].FontSize / 2);
        } else {
            drawingCanvasCtx.fillText(allText[d].Value, -allText[d].Width / 2, -allText[d].FontSize / 2);
        }
        drawingCanvasCtx.restore();
    }
    if (actionType === 'Text' && currentText && currentText.Value && currentText.Value.length > 0) {
        drawingCanvasCtx.fillStyle = '#0000FF';
        drawingCanvasCtx.font = currentText.FontSize + 'px ' + currentText.FontName;
        drawingCanvasCtx.fillText(currentText.Value, currentText.X, currentText.Y);
    }
    for (var a = 0; a < allCurves.length - (currentCurve ? 1 : 0); a++) {
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.moveTo(allCurves[a].StartX, allCurves[a].StartY);
        drawingCanvasCtx.quadraticCurveTo(allCurves[a].ControlPointX, allCurves[a].ControlPointY, allCurves[a].EndX, allCurves[a].EndY);
        if (selectedCurve === a) {
            drawingCanvasCtx.setLineDash([3, 3]);
        } else if (moveCurveIndex === a) {
            drawingCanvasCtx.setLineDash([2, 2]);
        }
        var setColor4 = false;
        for (var g = 0; g < selectedCurveColor.length; g++) {
            if (selectedCurveColor[g].Idx === a) {
                drawingCanvasCtx.strokeStyle = selectedCurveColor[g].Color;
                setColor4 = true;
                break;
            }
        }
        if (!setColor4) {
            drawingCanvasCtx.strokeStyle = '#000000';
        }
        drawingCanvasCtx.stroke();
        if (selectedCurve === a || moveCurveIndex === a) {
            drawingCanvasCtx.setLineDash([]);
        }
    }
    if (actionType === 'Curve' && currentCurve) {
        drawingCanvasCtx.strokeStyle = '#0000FF';
        drawingCanvasCtx.setLineDash([5, 5]);
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.moveTo(currentCurve.StartX, currentCurve.StartY);
        drawingCanvasCtx.quadraticCurveTo(currentCurve.ControlPointX, currentCurve.ControlPointY, currentCurve.EndX, currentCurve.EndY);
        drawingCanvasCtx.stroke();
        drawingCanvasCtx.setLineDash([]);
        drawingCanvasCtx.fillStyle = currentCurve.Editing === 0 ? '#008000' : '#000080';
        drawingCanvasCtx.fillRect(currentCurve.StartX - 2, currentCurve.StartY - 2, 5, 5);
        drawingCanvasCtx.fillStyle = currentCurve.Editing === 1 ? '#008000' : '#000080';
        drawingCanvasCtx.fillRect(currentCurve.ControlPointX - 2, currentCurve.ControlPointY - 2, 5, 5);
        drawingCanvasCtx.fillStyle = currentCurve.Editing === 2 ? '#008000' : '#000080';
        drawingCanvasCtx.fillRect(currentCurve.EndX - 2, currentCurve.EndY - 2, 5, 5);
    }
    for (var a = 0; a < allBezierCurves.length - (currentBezierCurve ? 1 : 0); a++) {
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.moveTo(allBezierCurves[a].StartX, allBezierCurves[a].StartY);
        drawingCanvasCtx.bezierCurveTo(allBezierCurves[a].ControlPoint1X,
            allBezierCurves[a].ControlPoint1Y, allBezierCurves[a].ControlPoint2X,
            allBezierCurves[a].ControlPoint2Y, allBezierCurves[a].EndX,
            allBezierCurves[a].EndY);
        if (selectedBezierCurve === a) {
            drawingCanvasCtx.setLineDash([3, 3]);
        } else if (moveBezierCurveIndex === a) {
            drawingCanvasCtx.setLineDash([2, 2]);
        }
        var setColor4 = false;
        for (var g = 0; g < selectedBezierCurveColor.length; g++) {
            if (selectedBezierCurveColor[g].Idx === a) {
                drawingCanvasCtx.strokeStyle = selectedBezierCurveColor[g].Color;
                setColor4 = true;
                break;
            }
        }
        if (!setColor4) {
            drawingCanvasCtx.strokeStyle = '#000000';
        }
        drawingCanvasCtx.stroke();
        if (selectedBezierCurve === a || moveBezierCurveIndex === a) {
            drawingCanvasCtx.setLineDash([]);
        }
    }
    if (actionType === 'BezierCurve' && currentBezierCurve) {
        drawingCanvasCtx.strokeStyle = '#0000FF';
        drawingCanvasCtx.setLineDash([5, 5]);
        drawingCanvasCtx.beginPath();
        drawingCanvasCtx.moveTo(currentBezierCurve.StartX, currentBezierCurve.StartY);
        drawingCanvasCtx.bezierCurveTo(currentBezierCurve.ControlPoint1X,
            currentBezierCurve.ControlPoint1Y, currentBezierCurve.ControlPoint2X,
            currentBezierCurve.ControlPoint2Y, currentBezierCurve.EndX,
            currentBezierCurve.EndY);
        drawingCanvasCtx.stroke();
        drawingCanvasCtx.setLineDash([]);
        drawingCanvasCtx.fillStyle = currentBezierCurve.Editing === 0 ? '#008000' : '#000080';
        drawingCanvasCtx.fillRect(currentBezierCurve.StartX - 2,
            currentBezierCurve.StartY - 2, 5, 5);
        drawingCanvasCtx.fillStyle = currentBezierCurve.Editing === 1 ? '#008000' : '#000080';
        drawingCanvasCtx.fillRect(currentBezierCurve.ControlPoint1X - 2,
            currentBezierCurve.ControlPoint1Y - 2, 5, 5);
        drawingCanvasCtx.fillStyle = currentBezierCurve.Editing === 2 ? '#008000' : '#000080';
        drawingCanvasCtx.fillRect(currentBezierCurve.ControlPoint2X - 2,
            currentBezierCurve.ControlPoint2Y - 2, 5, 5);
        drawingCanvasCtx.fillStyle = currentBezierCurve.Editing === 3 ? '#008000' : '#000080';
        drawingCanvasCtx.fillRect(currentBezierCurve.EndX - 2, currentBezierCurve.EndY - 2, 5, 5);
    }
}

function drawingCanvasOnMouseWheel(e) {
    if (actionType === 'Scale') {
        if (selectedSetOfPointsIndex > -1) {
            if (originalPointsBeingScaled.length === 0) {
                for (var i = 0; i < allSetsOfPoints[selectedSetOfPointsIndex].length; i++) {
                    originalPointsBeingScaled.push({ x: allSetsOfPoints[selectedSetOfPointsIndex][i].x, y: allSetsOfPoints[selectedSetOfPointsIndex][i].y });
                }
                tmpCenter = CalculateCenterOfGravityXY(originalPointsBeingScaled);
            }
            scaleFactor += e.deltaY < 0 ? 0.1 : -0.1;
            if (scaleFactor < 0.1) {
                scaleFactor = 0.1;
            }
            for (var j = 0; j < originalPointsBeingScaled.length; j++) {
                allSetsOfPoints[selectedSetOfPointsIndex][j].x = Math.round(originalPointsBeingScaled[j].x * scaleFactor);
                allSetsOfPoints[selectedSetOfPointsIndex][j].y = Math.round(originalPointsBeingScaled[j].y * scaleFactor);
            }
            var newCenter = CalculateCenterOfGravityXY(allSetsOfPoints[selectedSetOfPointsIndex]);
            for (var x = 0; x < allSetsOfPoints[selectedSetOfPointsIndex].length; x++) {
                allSetsOfPoints[selectedSetOfPointsIndex][x].x -= newCenter.X - tmpCenter.X;
                allSetsOfPoints[selectedSetOfPointsIndex][x].y -= newCenter.Y - tmpCenter.Y;
            }
            Draw();
        } else if (selectedEllipse > -1) {
            var scaleFactorEllipse = e.deltaY < 0 ? 1.1 : 0.9;
            if ((allEllipses[selectedEllipse].SemiMajorAxisLength > 10 && allEllipses[selectedEllipse].SemiMinorAxisLength > 10 && scaleFactorEllipse === 0.9) || scaleFactorEllipse === 1.1) {
                var centerX = (allEllipses[selectedEllipse].TopLeftX + allEllipses[selectedEllipse].BottomRightX) / 2;
                var centerY = (allEllipses[selectedEllipse].TopLeftY + allEllipses[selectedEllipse].BottomRightY) / 2;
                allEllipses[selectedEllipse].TopLeftX = Math.round(allEllipses[selectedEllipse].TopLeftX * scaleFactorEllipse);
                allEllipses[selectedEllipse].TopLeftY = Math.round(allEllipses[selectedEllipse].TopLeftY * scaleFactorEllipse);
                allEllipses[selectedEllipse].BottomRightX = Math.round(allEllipses[selectedEllipse].BottomRightX * scaleFactorEllipse);
                allEllipses[selectedEllipse].BottomRightY = Math.round(allEllipses[selectedEllipse].BottomRightY * scaleFactorEllipse);
                allEllipses[selectedEllipse].SemiMajorAxisLength = Math.abs(allEllipses[selectedEllipse].TopLeftX - allEllipses[selectedEllipse].BottomRightX);
                allEllipses[selectedEllipse].SemiMinorAxisLength = Math.abs(allEllipses[selectedEllipse].TopLeftY - allEllipses[selectedEllipse].BottomRightY);
                var newCenterX = (allEllipses[selectedEllipse].TopLeftX + allEllipses[selectedEllipse].BottomRightX) / 2;
                var newCenterY = (allEllipses[selectedEllipse].TopLeftY + allEllipses[selectedEllipse].BottomRightY) / 2;
                var offsetX = newCenterX - centerX;
                var offsetY = newCenterY - centerY;
                allEllipses[selectedEllipse].TopLeftX -= offsetX;
                allEllipses[selectedEllipse].TopLeftY -= offsetY;
                allEllipses[selectedEllipse].BottomRightX -= offsetX;
                allEllipses[selectedEllipse].BottomRightY -= offsetY;
                Draw();
            }
        } else if (selectedText > -1) {
            allText[selectedText].FontSize += e.deltaY < 0 ? 1 : (allText[selectedText].FontSize - 1 > 6 ? -1 : 0);
            drawingCanvasCtx.font = allText[selectedText].FontSize + 'px ' + allText[selectedText].FontName;
            var mt = drawingCanvasCtx.measureText(allText[selectedText].Value);
            allText[selectedText].Width = mt.width;
            Draw();
        } else if (selectedCurve > -1) {
            var scaleFactorCurve = e.deltaY < 0 ? 1.1 : 0.9;
            var t1 = allCurves[selectedCurve].StartX - allCurves[selectedCurve].EndX;
            t1 *= t1;
            var t2 = allCurves[selectedCurve].StartY - allCurves[selectedCurve].EndY;
            t2 *= t2;
            if ((t1 + t2 > 10000 && scaleFactorCurve === 0.9) || scaleFactorCurve === 1.1) {
                var centerX = (allCurves[selectedCurve].StartX + allCurves[selectedCurve].EndX) / 2;
                var centerY = (allCurves[selectedCurve].StartY + allCurves[selectedCurve].EndY) / 2;
                allCurves[selectedCurve].StartX = Math.round(allCurves[selectedCurve].StartX * scaleFactorCurve);
                allCurves[selectedCurve].StartY = Math.round(allCurves[selectedCurve].StartY * scaleFactorCurve);
                allCurves[selectedCurve].ControlPointX = Math.round(allCurves[selectedCurve].ControlPointX * scaleFactorCurve);
                allCurves[selectedCurve].ControlPointY = Math.round(allCurves[selectedCurve].ControlPointY * scaleFactorCurve);
                allCurves[selectedCurve].EndX = Math.round(allCurves[selectedCurve].EndX * scaleFactorCurve);
                allCurves[selectedCurve].EndY = Math.round(allCurves[selectedCurve].EndY * scaleFactorCurve);
                var newCenterX = (allCurves[selectedCurve].StartX + allCurves[selectedCurve].EndX) / 2;
                var newCenterY = (allCurves[selectedCurve].StartY + allCurves[selectedCurve].EndY) / 2;
                var offsetX = newCenterX - centerX;
                var offsetY = newCenterY - centerY;
                allCurves[selectedCurve].StartX -= offsetX;
                allCurves[selectedCurve].StartY -= offsetY;
                allCurves[selectedCurve].ControlPointX -= offsetX;
                allCurves[selectedCurve].ControlPointY -= offsetY;
                allCurves[selectedCurve].EndX -= offsetX;
                allCurves[selectedCurve].EndY -= offsetY;
                Draw();
            }
        } else if (selectedBezierCurve > -1) {
            var scaleFactorBezier = e.deltaY < 0 ? 1.1 : 0.9;
            var t3 = allBezierCurves[selectedBezierCurve].StartX - allBezierCurves[selectedBezierCurve].EndX;
            t3 *= t3;
            var t4 = allBezierCurves[selectedBezierCurve].StartY - allBezierCurves[selectedBezierCurve].EndY;
            t4 *= t4;
            if ((t3 + t4 > 10000 && scaleFactorBezier === 0.9) || scaleFactorBezier === 1.1) {
                var centerX = (allBezierCurves[selectedBezierCurve].StartX +
                    allBezierCurves[selectedBezierCurve].EndX) / 2;
                var centerY = (allBezierCurves[selectedBezierCurve].StartY +
                    allBezierCurves[selectedBezierCurve].EndY) / 2;
                allBezierCurves[selectedBezierCurve].StartX =
                    Math.round(allBezierCurves[selectedBezierCurve].StartX * scaleFactorBezier);
                allBezierCurves[selectedBezierCurve].StartY =
                    Math.round(allBezierCurves[selectedBezierCurve].StartY * scaleFactorBezier);
                allBezierCurves[selectedBezierCurve].ControlPoint1X =
                    Math.round(allBezierCurves[selectedBezierCurve].ControlPoint1X * scaleFactorBezier);
                allBezierCurves[selectedBezierCurve].ControlPoint1Y =
                    Math.round(allBezierCurves[selectedBezierCurve].ControlPoint1Y * scaleFactorBezier);
                allBezierCurves[selectedBezierCurve].ControlPoint2X =
                    Math.round(allBezierCurves[selectedBezierCurve].ControlPoint2X * scaleFactorBezier);
                allBezierCurves[selectedBezierCurve].ControlPoint2Y =
                    Math.round(allBezierCurves[selectedBezierCurve].ControlPoint2Y * scaleFactorBezier);
                allBezierCurves[selectedBezierCurve].EndX =
                    Math.round(allBezierCurves[selectedBezierCurve].EndX * scaleFactorBezier);
                allBezierCurves[selectedBezierCurve].EndY =
                    Math.round(allBezierCurves[selectedBezierCurve].EndY * scaleFactorBezier);
                var newCenterX = (allBezierCurves[selectedBezierCurve].StartX +
                    allBezierCurves[selectedBezierCurve].EndX) / 2;
                var newCenterY = (allBezierCurves[selectedBezierCurve].StartY +
                    allBezierCurves[selectedBezierCurve].EndY) / 2;
                var offsetX = newCenterX - centerX;
                var offsetY = newCenterY - centerY;
                allBezierCurves[selectedBezierCurve].StartX -= offsetX;
                allBezierCurves[selectedBezierCurve].StartY -= offsetY;
                allBezierCurves[selectedBezierCurve].ControlPoint1X -= offsetX;
                allBezierCurves[selectedBezierCurve].ControlPoint1Y -= offsetY;
                allBezierCurves[selectedBezierCurve].ControlPoint2X -= offsetX;
                allBezierCurves[selectedBezierCurve].ControlPoint2Y -= offsetY;
                allBezierCurves[selectedBezierCurve].EndX -= offsetX;
                allBezierCurves[selectedBezierCurve].EndY -= offsetY;
                Draw();
            }
        }
    }
}

function CalculateCenterOfGravityXY(arr) {
    var startCenterX = 0, startCenterY = 0;
    for (var j = 0; j < arr.length; j++) {
        startCenterX += arr[j].x;
        startCenterY += arr[j].y;
    }
    startCenterX = Math.round(startCenterX / arr.length);
    startCenterY = Math.round(startCenterY / arr.length);
    return { X: startCenterX, Y: startCenterY };
}

function CopyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        return clipboardData.setData("Text", text);

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");
        } catch (ex) {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}
