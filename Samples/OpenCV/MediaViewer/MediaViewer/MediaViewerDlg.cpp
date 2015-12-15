/********************************************************************************
* @file MediaViewerDlg.cpp
* @description Dialog of the program
*   - Browse file of image or video
*   - Support images: .jpg, .png
*   - Support video: .avi, .mp4, .wmv 
*   - Show the image into screen
*   - Show the frame 1 of video into screen
* @solution using OpenCV-2.4.6
* @license BSD
* @copyright mks.com.vn
*********************************************************************************/

#include "stdafx.h"
#include "MediaViewer.h"
#include "MediaViewerDlg.h"
#include "afxdialogex.h"
#include "MediaService.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// CAboutDlg dialog used for App About

class CAboutDlg : public CDialogEx {
public:
    CAboutDlg();

// Dialog Data
    enum { IDD = IDD_ABOUTBOX };

protected:
    virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support

// Implementation
protected:
    DECLARE_MESSAGE_MAP()
};

CAboutDlg::CAboutDlg() : CDialogEx(CAboutDlg::IDD) {
}

void CAboutDlg::DoDataExchange(CDataExchange* pDX) {
    CDialogEx::DoDataExchange(pDX);
}

BEGIN_MESSAGE_MAP(CAboutDlg, CDialogEx)
END_MESSAGE_MAP()


// CMediaViewerDlg dialog




CMediaViewerDlg::CMediaViewerDlg(CWnd* pParent /*=NULL*/)
    : CDialogEx(CMediaViewerDlg::IDD, pParent) {
    m_hIcon = AfxGetApp()->LoadIcon(IDR_MAINFRAME);
}

void CMediaViewerDlg::DoDataExchange(CDataExchange* pDX) {
    CDialogEx::DoDataExchange(pDX);
    DDX_Control(pDX, IDC_EDIT_FILE_PATH, m_editFilePath);
    DDX_Control(pDX, IDC_STATIC_IMAGE_VIEWER, m_ctrlImageViewer);
    DDX_Control(pDX, IDC_STATIC_FRAMENO, m_lblFrameNo);
    DDX_Control(pDX, IDC_EDIT_FRAMENO, m_txtFrameNo);
    DDX_Control(pDX, IDC_CHECK_VISIBLE, m_chkVisible);
}

BEGIN_MESSAGE_MAP(CMediaViewerDlg, CDialogEx)
    ON_WM_SYSCOMMAND()
    ON_WM_PAINT()
    ON_WM_QUERYDRAGICON()
    ON_BN_CLICKED(IDC_BUTTON_BROWSE, &CMediaViewerDlg::OnBnClickedButtonBrowse)
    ON_BN_CLICKED(IDC_BUTTON_SHOW, &CMediaViewerDlg::OnBnClickedButtonShow)
    ON_BN_CLICKED(IDC_CHECK_VISIBLE, &CMediaViewerDlg::OnBnClickedCheckVisible)
END_MESSAGE_MAP()


// CMediaViewerDlg message handlers

BOOL CMediaViewerDlg::OnInitDialog() {
    CDialogEx::OnInitDialog();

    // Add "About..." menu item to system menu.

    // IDM_ABOUTBOX must be in the system command range.
    ASSERT((IDM_ABOUTBOX & 0xFFF0) == IDM_ABOUTBOX);
    ASSERT(IDM_ABOUTBOX < 0xF000);

    CMenu* pSysMenu = GetSystemMenu(FALSE);
    if (pSysMenu != NULL) {
        BOOL bNameValid;
        CString strAboutMenu;
        bNameValid = strAboutMenu.LoadString(IDS_ABOUTBOX);
        ASSERT(bNameValid);
        if (!strAboutMenu.IsEmpty()) {
            pSysMenu->AppendMenu(MF_SEPARATOR);
            pSysMenu->AppendMenu(MF_STRING, IDM_ABOUTBOX, strAboutMenu);
        }
    }

    // Set the icon for this dialog.  The framework does this automatically
    //  when the application's main window is not a dialog
    SetIcon(m_hIcon, TRUE);			// Set big icon
    SetIcon(m_hIcon, FALSE);		// Set small icon

    // TODO: Add extra initialization here
    m_txtFrameNo.SetWindowText(_T("1"));
    m_chkVisible.SetCheck(1);

    return TRUE;  // return TRUE  unless you set the focus to a control
}

void CMediaViewerDlg::OnSysCommand(UINT nID, LPARAM lParam) {
    if ((nID & 0xFFF0) == IDM_ABOUTBOX) {
        CAboutDlg dlgAbout;
        dlgAbout.DoModal();
    } else {
        CDialogEx::OnSysCommand(nID, lParam);
    }
}

// If you add a minimize button to your dialog, you will need the code below
//  to draw the icon.  For MFC applications using the document/view model,
//  this is automatically done for you by the framework.

void CMediaViewerDlg::OnPaint() {
    if (IsIconic()) {
        CPaintDC dc(this); // device context for painting

        SendMessage(WM_ICONERASEBKGND, reinterpret_cast<WPARAM>(dc.GetSafeHdc()), 0);

        // Center icon in client rectangle
        int cxIcon = GetSystemMetrics(SM_CXICON);
        int cyIcon = GetSystemMetrics(SM_CYICON);
        CRect rect;
        GetClientRect(&rect);
        int x = (rect.Width() - cxIcon + 1) / 2;
        int y = (rect.Height() - cyIcon + 1) / 2;

        // Draw the icon
        dc.DrawIcon(x, y, m_hIcon);
    } else {
        CDialogEx::OnPaint();
    }
}

// The system calls this function to obtain the cursor to display while the user drags
//  the minimized window.
HCURSOR CMediaViewerDlg::OnQueryDragIcon() {
    return static_cast<HCURSOR>(m_hIcon);
}



void CMediaViewerDlg::OnBnClickedButtonBrowse() {
    CFileDialog	*dlg = new CFileDialog(
        TRUE,
        NULL,
        NULL,
        OFN_FILEMUSTEXIST | OFN_OVERWRITEPROMPT | OFN_PATHMUSTEXIST,
        _T("All files|*.*|"),
        AfxGetMainWnd());

    if( dlg->DoModal() == IDOK) {
        m_editFilePath.SetWindowText(dlg->GetPathName());
    }

    delete dlg;
    dlg = NULL;
}


void CMediaViewerDlg::OnBnClickedButtonShow() {
    // Content path of media
    CString strMediaPath;

    // Get file path from screen
    m_editFilePath.GetWindowText(strMediaPath);

	if (MediaAnalyzer::IsPicture(strMediaPath) != FALSE) {
		// Demo: load image from file
		MediaService::LoadImage(strMediaPath, m_ctrlImageViewer);
	} else if (MediaAnalyzer::IsVideo(strMediaPath) != FALSE) {
		// Demo: load image from given frame no of video
        CString strFrameNo;
        m_txtFrameNo.GetWindowText(strFrameNo);
        int nFrameNo = _wtoi(strFrameNo);

		MediaService::LoadFrame(strMediaPath, nFrameNo, m_ctrlImageViewer);
	}
}


void CMediaViewerDlg::OnBnClickedCheckVisible()
{
    int nCheck = m_chkVisible.GetCheck();
    BOOL REPAINT = TRUE;

    if (nCheck != 0) {
        // Unhide the Image Control
        // Attach(m_hCtrlImageViewer);
        //CCtrlPicture *tmp = (CCtrlPicture *) FromHandlePermanent(m_hCtrlImageViewer);
        //m_ctrlImageViewer = *tmp;
        //SubclassWindow(m_hCtrlImageViewer);

        m_ctrlImageViewer.UnlockWindowUpdate();

        m_ctrlImageViewer.MoveWindow(0, 0,
            m_rectImageViewer.Width(),
            m_rectImageViewer.Height(),
            REPAINT);

        Invalidate();
    } else {
        // Unhide the Image Control
        
        // Save the current Size of Image Control
        m_ctrlImageViewer.GetWindowRect(m_rectImageViewer);

        m_ctrlImageViewer.LockWindowUpdate();
        m_ctrlImageViewer.MoveWindow(0,0,0,0, REPAINT);
        Invalidate();
    }
}
