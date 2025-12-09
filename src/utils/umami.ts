declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

/**
 * Umami Analytics Tracker
 * Provides typed wrapper for Umami custom events
 */
export const umami = {
  /**
   * Track a custom event
   * @param eventName - Name of the event
   * @param eventData - Optional data to send with the event
   */
  track: (eventName: string, eventData?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track(eventName, eventData);
    }
  },

  /**
   * Track blog post view
   * @param blogTitle - Title of the blog post
   * @param blogSlug - URL slug of the blog post
   * @param readingTime - Estimated reading time
   * @param tags - Blog post tags
   */
  trackBlogView: (
    blogTitle: string,
    blogSlug: string,
    readingTime?: string,
    tags?: string[]
  ) => {
    umami.track("blog-view", {
      title: blogTitle,
      slug: blogSlug,
      readingTime,
      tags: tags?.join(", "),
    });
  },

  /**
   * Track project view
   * @param projectTitle - Title of the project
   * @param projectSlug - URL slug of the project
   */
  trackProjectView: (projectTitle: string, projectSlug: string) => {
    umami.track("project-view", {
      title: projectTitle,
      slug: projectSlug,
    });
  },

  /**
   * Track external link click
   * @param url - The external URL clicked
   * @param label - Optional label for the link
   */
  trackExternalLink: (url: string, label?: string) => {
    umami.track("external-link", {
      url,
      label,
    });
  },

  /**
   * Track social media link click
   * @param platform - Social media platform (e.g., "twitter", "github", "linkedin")
   */
  trackSocialClick: (platform: string) => {
    umami.track("social-click", {
      platform,
    });
  },

  /**
   * Track Medium blog link click
   * @param blogTitle - Title of the blog post
   */
  trackMediumClick: (blogTitle: string) => {
    umami.track("medium-click", {
      title: blogTitle,
    });
  },

  /**
   * Track contact form submission
   * @param method - Contact method (e.g., "email", "form")
   */
  trackContact: (method: string) => {
    umami.track("contact", {
      method,
    });
  },

  /**
   * Track download
   * @param fileName - Name of the downloaded file
   * @param fileType - Type of file (e.g., "pdf", "resume")
   */
  trackDownload: (fileName: string, fileType: string) => {
    umami.track("download", {
      fileName,
      fileType,
    });
  },
};
