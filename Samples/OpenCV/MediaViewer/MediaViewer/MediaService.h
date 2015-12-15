#pragma once

#include "ctrlpicture.h"
#include "MediaAnalyzer.h"

class MediaService {
public:
    MediaService(void);
    ~MediaService(void);

    static void LoadImage(CString strImagePath, CCtrlPicture &ctrlImageViewer);
    static void LoadFrame(CString strVideoPath, int frameNo, CCtrlPicture &ctrlImageViewer);
};

