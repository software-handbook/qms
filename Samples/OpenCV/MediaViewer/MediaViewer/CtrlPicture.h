
#pragma once
#include "afxwin.h"
#include "Constant.h"
#include "MediaAnalyzer.h"
#include "highgui.hpp"

using namespace cv;

/**
* This class provides interfaces of control picture.
* <br/>
*/
class CCtrlPicture : public CStatic {
public:

    // Constructor
    CCtrlPicture(void);

    // Destructor
    ~CCtrlPicture(void);

    // Loads an image from a file
    BOOL LoadFromFile(const CString &szFilePath);

    // Loads an image from an IStream interface
    BOOL LoadFromStream(IStream *piStream);

    // Loads an image from a byte stream;
    BOOL LoadFromStream(const BYTE *pData, const size_t nSize);

    // Overload - Single load function
    BOOL Load(const CString &szFilePath);
    BOOL Load(IStream *piStream);
    BOOL Load(const BYTE *pData, const size_t nSize);
    // BOOL Load(Mat &pFrame);
	BOOL Load(IplImage *pImage);

    void CreateOffScreen(const int nWidth, const int nHeight);

    // Frees the image data
    void FreeData();

protected:
    virtual void PreSubclassWindow();

    // Draws the Control
    virtual void DrawItem(LPDRAWITEMSTRUCT lpDrawItemStruct);
    virtual BOOL OnEraseBkgnd(CDC *pDC);

private:
    BOOL m_bCreatedOffScreen;
    // Offscreen device context
    CImage m_imgOffScreen;

    // Internal image stream buffer
    IStream *m_pStream;

	int m_nChannelNo;
	IplImage *m_pImage;
    // Control flag if a pic is loaded
    BOOL m_bIsPicLoaded;

    // GDI Plus Token
    ULONG_PTR m_gdiplusToken;

    // Draw image stream
    void DrawStream(CDC *pScreenDC);

	// Draw image frame
    void DrawFrame(CDC *pScreenDC);
};
