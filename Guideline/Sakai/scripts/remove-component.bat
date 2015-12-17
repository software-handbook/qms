REM This script tries to delete some modules which I don't need them while testing my applications
REM It moved the modules into folder "deleted" instead of remove physically

mkdir .\deleted\components
mkdir -p .\deleted\webapps

REM move .\components\basiclti-pack .\deleted\components
REM move .\webapps\basiclti-admin-tool.war .\deleted\webapps

move .\components\sakai-warehouse-component .\deleted\components
move .\components\osp-warehouse-component .\deleted\components
REM move .\webapps\emailtemplateservice-tool.war .\deleted\webapps

move .\components\gradebook-service-pack .\deleted\components
move .\webapps\grades-rest.war .\deleted\webapps
move .\webapps\sakai-gradebook-tool.war .\deleted\webapps


move .\components\import-pack .\deleted\components
move .\webapps\imsblis.war .\deleted\webapps
move .\webapps\imsblti.war .\deleted\webapps



move .\components\lessonbuilder-components .\deleted\components
move .\webapps\lessonbuilder-tool.war .\deleted\webapps

REM move .\components\mailsender-pack .\deleted\components
REM move .\webapps\mailsender-tool.war .\deleted\webapps

move .\components\messageforums-components .\deleted\components
move .\webapps\messageforums-tool.war .\deleted\webapps

move .\components\sakai-news-pack .\deleted\components
move .\webapps\sakai-news-tool.war .\deleted\webapps

REM move .\components\sakai-mailarchive-pack .\deleted\components
REM move .\webapps\sakai-mailarchive-james.war .\deleted\webapps

move .\components\sakai-chat-pack .\deleted\components
move .\webapps\portal-chat.war .\deleted\webapps
move .\webapps\sakai-chat-tool.war .\deleted\webapps

move .\components\sakai-podcasts-pack .\deleted\components
move .\webapps\podcasts.war .\deleted\webapps
move .\webapps\sakai-podcasts.war .\deleted\webapps


move .\components\samigo-pack .\deleted\components
move .\webapps\samigo-app.war .\deleted\webapps


move .\components\sakai-rwiki-pack .\deleted\components
move .\webapps\sakai-rwiki-tool.war .\deleted\webapps
move .\webapps\wiki.war .\deleted\webapps

move .\components\sakai-assignment-pack .\deleted\components
move .\webapps\sakai-assignment-tool.war .\deleted\webapps

move .\components\sakai-comp-help .\deleted\components
move .\components\sakai-gradebooksample-grade-converter .\deleted\components

move .\webapps\sakai-gradebook-testservice.war .\deleted\webapps
move .\webapps\sakai-help-tool.war .\deleted\webapps
move .\webapps\polls-tool.war .\deleted\webapps

move .\webapps\sakai-citations-servlet.war .\deleted\webapps
move .\webapps\sakai-ws.war .\deleted\webapps


























