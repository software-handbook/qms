package m.k.s.webapp.spring.upload.model;

import java.io.Serializable;

import org.springframework.web.multipart.MultipartFile;

/**
 * @author Thach N. Le
 *
 */
public class VideoUploadModel implements Serializable {
	private String videoTitle;
	private MultipartFile videoFile;

	public String getVideoTitle() {
		return videoTitle;
	}

	public void setVideoTitle(String videoTitle) {
		this.videoTitle = videoTitle;
	}

	public MultipartFile getVideoFile() {
		return videoFile;
	}

	public void setVideoFile(MultipartFile videoFile) {
		this.videoFile = videoFile;
	}
}
