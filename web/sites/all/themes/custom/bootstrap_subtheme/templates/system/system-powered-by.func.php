<?php
/**
 * @file
 * Overrides theme_system_powered_by().
 */

/**
 * Overrides theme_system_powered_by().
 */
function bootstrap_subtheme_system_powered_by() {
  return '<div class="col-sm-12">' . t('Powered by <a href="@poweredby" target="_blank">Drupal Bootstrap</a>', array('@poweredby' => 'https://www.drupal.org/project/bootstrap')) . '</div>';
}
