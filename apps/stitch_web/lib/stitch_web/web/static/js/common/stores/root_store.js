import AddonStore from "./addon_store";
import AdminPanelStore from "./admin_panel_store";
import BillingStore from "./billing_store";
import ChannelStore from "./channel_store";
import ExportStore from "./export_store";
import FilesStore from "./files_store";
import TeamFileStore from "./team_file_store";
import TeamFilesStore from "./team_files_store";
import GlobalStarredMessageStore from "./global_starred_message_store";
import GroupStore from "./group_store";
import GroupsStore from "./groups_store";
import InvitationStore from "./invitation_store";
import MentionsStore from "./mentions_store";
import MessageStore from "./message_store";
import NotificationStore from "./notification_store";
import PinnedMessageStore from "./pinned_message_store";
import PresenceStore from "./presence_store";
import SearchStore from "./search_store";
import SidemenuStore from "./sidemenu_store";
import SocketStore from "./socket_store";
import TeamStore from "./team_store";
import TitleStore from "./title_store";
import UploadStore from "./upload_store";
import UserStore from "./user_store";
import UsersStore from "./users_store";
import DesktopStore from "./desktop_store";
import AccessLogsStore from "./access_logs_store";
import IntegrationStore from "./integration_store";
import NewsStore from "./news_store";
import PatientsStore from "./patients_store";
import InboxStore from "./inbox_store";
import ConversationMessageStore from "./conversation_message_store";

class RootStore {
  constructor(props) {
    this.appParams = Object.assign({}, props);

    this.createStores();
    this.joinChannels();
    this.onStoreInit();
  }

  createStores() {
    this.addonStore = new AddonStore(this);
    this.adminPanelStore = new AdminPanelStore(this);
    this.billingStore = new BillingStore(this);
    this.channelStore = new ChannelStore(this);
    this.exportStore = new ExportStore(this);
    this.filesStore = new FilesStore(this);
    this.globalStarredMessageStore = new GlobalStarredMessageStore(this);
    this.teamFileStore = new TeamFileStore(this);
    this.teamFilesStore = new TeamFilesStore(this);
    this.groupStore = new GroupStore(this);
    this.groupsStore = new GroupsStore(this);
    this.invitationStore = new InvitationStore(this);
    this.notificationStore = new NotificationStore(this);
    this.messageStore = new MessageStore(this);
    this.mentionsStore = new MentionsStore(this);
    this.pinnedMessageStore = new PinnedMessageStore(this);
    this.presenceStore = new PresenceStore(this, this.appParams);
    this.searchStore = new SearchStore(this);
    this.sidemenuStore = new SidemenuStore(this, this.appParams);
    this.socketStore = new SocketStore(this);
    this.teamStore = new TeamStore(this);
    this.titleStore = new TitleStore(this, this.appParams);
    this.uploadStore = new UploadStore(this);
    this.userStore = new UserStore(this);
    this.usersStore = new UsersStore(this);
    this.desktopStore = new DesktopStore(this);
    this.accessLogsStore = new AccessLogsStore(this);
    this.integrationStore = new IntegrationStore(this);
    this.newsStore = new NewsStore(this);
    this.patientsStore = new PatientsStore(this);
    this.inboxStore = new InboxStore(this);
    this.conversationMessageStore = new ConversationMessageStore(this);
  }

  onStoreInit() {
    this.sidemenuStore.loadApp();
    this.notificationStore.loadPreferences();
    this.newsStore.loadNewsStories();

    if (currentUser.roles && currentUser.roles.includes("admin")) {
      this.billingStore.initialBillingLoad();
    }
  }

  joinChannels() {
    this.channelStore.joinEventChannel();
    this.channelStore.joinTeamChannel();
  }
}

export default RootStore;
