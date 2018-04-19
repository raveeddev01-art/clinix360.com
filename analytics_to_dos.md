# Analytics Needs:

## For Each Team

* Number of Total Users
  * For each day (graph)
* Number of Monthly Active Users
  * For each day (graph)
* Number of Weekly Active Users
  * For each day (graph)
* Number of Daily Active Users
  * For each day (graph)
* Count of Messages Sent
  * For each day (graph)
* Count of Files Uploaded
  * For each day (graph)
* Count of Messages By
  * For each day
  * Mobile/Desktop/Andoid/iOS
* Count of Sessions
  * For each day
  * Mobile/Desktop/Andoid/iOS

Note: Active means Sent any messages or Session (now)

* Eventually it'll mean read or sent.

# Team Analytics To Dos:

* Find or Build a user device function(s) - DONE
  * Mobile vs Desktop vs Web - DONE
  * iOS vs Android vs Other - DONE
  * Windows vs Mac vs Other - DONE
* Add info to the message table - DONE
* Parse things better and code cleanup - DONE
* Handle socket user agent info - DONE

* Query Work

  * Add device filtering to the backend
  * Add device filtering to the frontend
  * Add a daily active users request on the analytics page
  * Add a monthly active users request on the analytics page
  * Add a weekly active users request on the analytics page

* Some daily TeamSnapshot Report

  * DailyReport Worker kicks off new event
  * Event snapshots a couple easy fields
    * Messages
    * Files uploaded
  * Add new table for TeamSnapshots
  * Worker writes to the table
  * Add few more interesting queries
    * DAU, WAU, MAU

* Add any good and readily available info to the identification events

  * Message send event

* Add message_read event to segment

  * with user agent info
  * with room type info

* Add session started event to segment

  * with user agent info

<!-- ===================== -->

<!--   CUSTOMER JOURNEY    -->

<!-- ===================== -->

<!-- TODO: THIS IS SEPARATE, FIGURE IT OUT -->

<!-- ===================== -->

<!--         LATER         -->

<!-- ===================== -->

* Message reads are stored in redis
  * With metadata (user agent and time and user and team)
* TeamSnapshot reads and stores the read count in that day
* TeamSnapshot worker deletes the old redis events

<!-- ===================== -->

<!--         LATER         -->

<!-- ===================== -->

* Later: Add a version field to user identification events

  * Find good spot to get versions
    * For Mobile
    * Web
  * Add data point to events themselves

* Later: Online Time (by team and platforms listed above)
  * todo: figure out how to do this well
  * will be part of the daily snapshot

# Customer Journey Needs:

* Count, Teams Acquired
* Count, Teams Activated (w/ 500 messages & SOMETHING_ASK_BHARAT)
* Count, Teams Activated and currently Active (100 messages in last week)
* Count, Teams Paying

* All the above is sortable by team info

  * When they were created
    * Day, Month, Year
  * EHR/EMR
  * Team Size (asked)
  * Other metrics we now know

# Customer To Dos:

TBD

* Add EMR/Team Size, Created At Timeframes to segment ID

# User Identification Needs:

Would be nice to have a way to see story
about a user at a glace. When signed up, what
version of app they're on, etc...

# User Identification To Dos:

TBD
