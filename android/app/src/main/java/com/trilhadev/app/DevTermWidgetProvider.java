package com.trilhadev.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;

/**
 * Widget de home screen "Termo do dia": mostra um termo de desenvolvimento +
 * significado, trocando a cada 12h. Índice calculado a partir do relógio do
 * aparelho, sem precisar salvar estado nem backend.
 */
public class DevTermWidgetProvider extends AppWidgetProvider {

    private static final long SLOT_DURATION_MILLIS = 12L * 60 * 60 * 1000;
    private static final int COMPACT_HEIGHT_THRESHOLD_DP = 100;
    private static final int HINT_MAX_DEFINITION_CHARS = 60;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager,
            int appWidgetId, Bundle newOptions) {
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    private static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        String[] term = currentTerm();
        int layoutRes = isCompact(appWidgetManager, appWidgetId)
            ? R.layout.widget_dev_term_compact
            : R.layout.widget_dev_term;

        RemoteViews views = new RemoteViews(context.getPackageName(), layoutRes);
        views.setTextViewText(R.id.widget_term, term[0]);
        views.setTextViewText(R.id.widget_definition, term[1]);
        views.setViewVisibility(R.id.widget_hint,
            term[1].length() > HINT_MAX_DEFINITION_CHARS ? View.GONE : View.VISIBLE);

        Intent openApp = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            openApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_label, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_term, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_definition, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static boolean isCompact(AppWidgetManager appWidgetManager, int appWidgetId) {
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minHeightDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0);
        return minHeightDp > 0 && minHeightDp < COMPACT_HEIGHT_THRESHOLD_DP;
    }

    private static String[] currentTerm() {
        long slot = System.currentTimeMillis() / SLOT_DURATION_MILLIS;
        int index = (int) (slot % DevTerms.LIST.length);
        return DevTerms.LIST[index];
    }
}
