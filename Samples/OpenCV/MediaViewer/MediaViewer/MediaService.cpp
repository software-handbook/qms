/********************************************************************************
* @class MediaService
* @description provides features:
*   - Load image from file path to screen via custom picture control "CCtrlPicture"
*   - Load given frame of file video to screen via custom picture control "CCtrlPicture"
* @solution using OpenCV-2.4.6
* @license BSD
* @copyright mks.com.vn
*********************************************************************************/
#include "StdAfx.h"
#include "MediaService.h"


MediaService::MediaService(void) {
}


MediaService::~MediaService(void) {
}


/**
* Demo load image from the file path.
* @param strImagePath
* @param ctrlImageViewer output
*/
void MediaService::LoadImage(CString strImagePath, CCtrlPicture &ctrlImageViewer) {

    ctrlImageViewer.CreateOffScreen(IMAGE_WIDTH, IMAGE_HEIGHT);
    ctrlImageViewer.Load(strImagePath);
}

/**
* Demo load image from a frame of video.
* @param strVideoPath
* @param frameNo
* @param ctrlImageViewer output
*/

void MediaService::LoadFrame(CString strVideoPath, int nFrameNo, CCtrlPicture &ctrlImageViewer) {
    bool bResult;
    ctrlImageViewer.CreateOffScreen(IMAGE_WIDTH, IMAGE_HEIGHT);

    string stdStrMediaPath = CW2A(strVideoPath);
    VideoCapture videoCapture = VideoCapture(stdStrMediaPath);

    if (videoCapture.isOpened() == FALSE) {
        bResult = videoCapture.open(stdStrMediaPath);
    } else {
        // No statement
    }

    // Read video to OpenCV Mat object
    Mat frame;
    MediaAnalyzer::CaptureImageAtFrame(videoCapture, nFrameNo, frame);

    // Convert Mat to IplImage
    IplImage* destFrame = cvCloneImage(&(IplImage) frame);
    ctrlImageViewer.Load(destFrame);
}
